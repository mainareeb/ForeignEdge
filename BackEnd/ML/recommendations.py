"""ML Recommendations for ForeignEdge - Profile Matching"""
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import joblib
from firebase_setup import db
from datetime import datetime

class RecommendationEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.scholarships_df = None
        self.universities_df = None
        self.model = None

    def load_data(self):
        """Load scholarships and universities from Firestore"""
        # Scholarships
        scholarships = db.collection('scholarships').stream()
        self.scholarships_df = pd.DataFrame([doc.to_dict() for doc in scholarships])
        
        # Universities  
        unis = db.collection('universities').stream()
        self.universities_df = pd.DataFrame([doc.to_dict() for doc in unis])
        
        print(f"Loaded {len(self.scholarships_df)} scholarships, {len(self.universities_df)} universities")

    def preprocess_profile(self, profile):
        """Convert user profile to feature vector"""
        skills_text = ' '.join(profile.get('skills', []))
        field = profile.get('field', '')
        degree = profile.get('degree', '')
        gpa = float(profile.get('gpa', 0)) / 4.0 if profile.get('gpa') else 0
        ielts = float(profile.get('ieltsScore', 0))
        
        profile_features = f"{skills_text} {field} {degree} gpa:{gpa} ielts:{ielts}"
        return profile_features

    def fit_model(self):
        """Fit recommendation model"""
        if self.scholarships_df is None or self.universities_df is None:
            self.load_data()
            
        # Combine scholarships and universities
        sch_text = self.scholarships_df['description'].fillna('') + ' ' + self.scholarships_df['field'].fillna('')
        uni_text = self.universities_df['ranking'].fillna('') + ' ' + self.universities_df['type'].fillna('')
        
        all_texts = pd.concat([sch_text, uni_text], ignore_index=True)
        self.vectorizer.fit(all_texts)
        
        print("Model fitted!")

    def recommend_for_user(self, user_profile, top_k=10):
        """Recommend scholarships and universities for user"""
        if self.model is None:
            self.fit_model()
            
        profile_vec = self.vectorizer.transform([self.preprocess_profile(user_profile)])
        
        # Scholarship recommendations
        sch_desc = self.scholarships_df['description'].fillna('') + ' ' + self.scholarships_df['field'].fillna('')
        sch_vec = self.vectorizer.transform(sch_desc)
        sch_sim = cosine_similarity(profile_vec, sch_vec).flatten()
        top_sch_idx = np.argsort(sch_sim)[-top_k//2:][::-1]
        
        # University recommendations
        uni_desc = self.universities_df['ranking'].fillna('') + ' ' + self.universities_df['type'].fillna('')
        uni_vec = self.vectorizer.transform(uni_desc)
        uni_sim = cosine_similarity(profile_vec, uni_vec).flatten()
        top_uni_idx = np.argsort(uni_sim)[-top_k//2:][::-1]
        
        recommendations = {
            'scholarships': self.scholarships_df.iloc[top_sch_idx].to_dict('records'),
            'universities': self.universities_df.iloc[top_uni_idx].to_dict('records'),
            'scores': {
                'scholarships': sch_sim[top_sch_idx].tolist(),
                'universities': uni_sim[top_uni_idx].tolist()
            }
        }
        
        return recommendations

# API Endpoint (Flask route)
def get_recommendations(user_email):
    """Get recommendations for specific user"""
    user_ref = db.collection('users').document(user_email)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        return {'error': 'User not found'}
    
    user_profile = user_doc.to_dict()
    engine = RecommendationEngine()
    
    return engine.recommend_for_user(user_profile)

if __name__ == "__main__":
    # Test
    test_profile = {
        'skills': ['Python', 'Machine Learning', 'Data Analysis'],
        'field': 'Computer Science',
        'degree': 'Bachelor',
        'gpa': '3.8',
        'ieltsScore': '7.5'
    }
    
    engine = RecommendationEngine()
    recs = engine.recommend_for_user(test_profile)
    print("Sample recommendations:", recs)

