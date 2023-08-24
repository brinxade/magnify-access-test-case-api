const mongoose = require('mongoose');

(async () => {
    try {
        await mongoose.connect(process.env.DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("Connected with MongoDB");
    } catch (error) {
        console.log(error.message)
    }
})();