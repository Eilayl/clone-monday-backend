exports.signup = async (req, res) => {
    try {
        return res.status(200).json({ message: "Signup route is working" });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
}