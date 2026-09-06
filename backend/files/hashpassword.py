from flask_bcrypt import Bcrypt
bcrypt = Bcrypt()
hashed_password = bcrypt.generate_password_hash('jolegaspi1234').decode('utf-8')
print(hashed_password)

#B3codo@2026