// Temporary middleware that simulates authentication
// This should be replaced with a proper authentication system in production

const tempAuth = (req, res, next) => {
    // Set a mock user for development
    req.user = {
        _id: '65ff4f21c84a6c7d5b183e85', // A dummy ID - replace with a real one if needed
        email: 'employee@example.com',
        name: 'John Doe',
        role: 'employee',
        isAdmin: false
    };
    next();
};

module.exports = { tempAuth }; 