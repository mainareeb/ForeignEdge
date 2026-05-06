import bcrypt
import os

def hash_password(password):
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password, hashed):
    """Verify password against bcrypt hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def encrypt_data(data):
    """Keep AES for non-password data encryption (existing endpoints)"""
    from Crypto.Cipher import AES
    from Crypto.Util.Padding import pad, unpad
    import base64
    
    SECRET_KEY = os.getenv('AES_KEY', 'ForeignEdge12345ForeignEdge12345').encode('utf-8')
    try:
        cipher = AES.new(SECRET_KEY, AES.MODE_CBC)
        encrypted = cipher.encrypt(pad(data.encode('utf-8'), AES.block_size))
        result = base64.b64encode(cipher.iv + encrypted).decode('utf-8')
        return result
    except Exception:
        return None

def decrypt_data(encrypted_data):
    """Decrypt AES data"""
    from Crypto.Cipher import AES
    from Crypto.Util.Padding import pad, unpad
    import base64
    
    SECRET_KEY = os.getenv('AES_KEY', 'ForeignEdge12345ForeignEdge12345').encode('utf-8')
    try:
        raw = base64.b64decode(encrypted_data)
        iv = raw[:16]
        encrypted = raw[16:]
        cipher = AES.new(SECRET_KEY, AES.MODE_CBC, iv)
        decrypted = unpad(cipher.decrypt(encrypted), AES.block_size)
        return decrypted.decode('utf-8')
    except Exception:
        return None
