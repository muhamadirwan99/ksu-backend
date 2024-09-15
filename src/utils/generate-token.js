import jwt from 'jsonwebtoken'; // Make sure you import jsonwebtoken

const generateToken = (user) => {
    // The payload can contain any user data you want to include
    const payload = {
        username: user.username,
    };

    const secretKey = process.env.JWT_SECRET_KEY; // Ensure this is set in your .env file

    if (!secretKey) {
        throw new Error('JWT Secret Key is missing in environment variables.');
    }

    const options = {
        expiresIn: '14h', // Token expiration time
    };

    return jwt.sign(payload, secretKey, options);
};

export { generateToken };
