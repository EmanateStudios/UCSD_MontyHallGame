require("dotenv").config();
const express = require("express");
const path = require("path");
const { Op } = require("sequelize");
const cors = require('cors');

const { sequelize, subject, exitInterview, trial, quiz, demographics } = require("./models"); //<--this is actually the database (very confusing way sequelize works but it does. You don't have to specify index.js, it defaults to index)


const app = express();
// ------------MIDDLEWARE--------------
app.use(cors());
// ------------------------------------------------------
// we'll allow either json or urlencoded requests
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies
app.use(express.json({ extended: false })); //Used to parse JSON bodies;
app.use(express.text({ limit: "1000mb" })); //Used to parse text/plain bodies;
//------------------ ROUTES ----------------------------------

//================ALL THE GET DATA================


//================ALL THE PUT DATA================
app.put('/api/exit', async (req, res) => {

    const { finish_date_time, condition, hunch1, hunch1_level, hunch2, hunch2_level, hunch3, hunch3_level, has_hunch, last_action, completed_block_100percent_after_trial, aborted, blur_1_seconds, blur_2_seconds, onTask, playMethod, subjectId } = req.body;

    try {
        // look for the subject
        let existingExitInterview = await exitInterview.findOne({ where: { subjectId } });
        if (existingExitInterview) {
            existingExitInterview.update({
                finish_date_time, condition, hunch1, hunch1_level, hunch2, hunch2_level, hunch3, hunch3_level, has_hunch, last_action, completed_block_100percent_after_trial, aborted, blur_1_seconds, blur_2_seconds, onTask, playMethod
            })
            res.status(200).send('Successfully update exit interview')
        } else {
            res.status(500).send("No entry found. Game may not have finished correctly");
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});


//================ALL THE POST DATA================
// CREATE NEW DATA SUBJECT
app.post('/api/subject', async (req, res) => {

    const { startTime_consent, endTime_consent, firstName, lastName, email, wantsConsentEmailed, screenWidth, screenHeight, userAgent } = req.body;

    // check if email exists
    const existingUser = await subject.findOne({ where: { email } });

    if (existingUser) {
        return res.status(400).send({ msg: "email already exists" });
    }
    else {
        try {
            // first create new subject
            const newSubject = await subject.create({
                startTime_consent, endTime_consent, firstName, lastName, email, wantsConsentEmailed, screenWidth, screenHeight, userAgent
            });
            res.status(200).json({ subject: newSubject.id })
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    }
});
// CREATE NEW DEMOGRAPHIC
app.post('/api/demographic', async (req, res) => {

    const { age, gender, demographic, subjectId } = req.body;

    try {
        // first create new subject
        const newSubject = await demographics.create({
            age, gender, demographic, subjectId
        });
        res.status(200).json({ subject: newSubject.id })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});
// CREATE EXIT INTERVIEW
app.post('/api/exit', async (req, res) => {

    const { finish_date_time, condition, hunch1, hunch1_level, hunch2, hunch2_level, hunch3, hunch3_level, has_hunch, last_action, aborted, subjectId } = req.body;

    try {
        // first create new subject
        await exitInterview.create({
            finish_date_time, condition, hunch1, hunch1_level, hunch2, hunch2_level, hunch3, hunch3_level, has_hunch, last_action, aborted, subjectId
        });

        res.status(200).send({ msg: "Exit Interview Added Successfully" })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});
// CREATE QUIZ TABLE
app.post('/api/quiz', async (req, res) => {

    const { startTime_quiz, endTime_quiz, subjectId } = req.body;

    try {
        // first create new subject
        await quiz.create({
            startTime_quiz, endTime_quiz, subjectId
        });

        res.status(200).send({ msg: "Quiz Added Successfully" })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});
// CREATE NEW TRIAL ASSIGNED TO SUBJECT
app.post('/api/trial', async (req, res) => {

    const { trialIteration,round,score,pReward,xClick,yClick,door,success,subjectId,abandonedPage } = req.body;

    try {
        // first create new subject
        await trial.create({
            trialIteration,round,score,pReward,xClick,yClick,door,success,subjectId,abandonedPage
        });

        res.status(200).send({ msg: "Trial Round Successfully" })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});
// LOGIN TO DATA
app.post('/auth', async (req, res) => {
    const credentials = req.body.credentials;
    if (credentials == process.env.DB_SK) {
        try {
            res.status(200).json(credentials);
        } catch (err) {
            console.error(err)
        }
    } else {
        try {
            return res.status(403).send({ msg: "incorrect password" });
        } catch (err) {
            console.error(err);
        }
    }
});

//=============== DELETING DATA=====================
app.delete('/api/trials', async (req, res) => {
    const { subjectId, credentials } = req.body;

    if (credentials === process.env.DB_SK) {
        try {
            // delete all entries from user
            await trial.destroy({ where: { subjectId } });

            return res.status(200).send({ msg: "Trials Successfully Removed" })
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    } else {
        res.status(403).send('Invalid access request');
    }
});
app.delete('/api/trial/all', async(req,res)=>{
    const { credentials } = req.body;

    if (credentials === process.env.DB_SK) {
        try {
            // delete all trials entries
            await trial.destroy({ where: {},truncate:true });

            return res.status(200).send({ msg: "ALL Trials Successfully Removed" })
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    } else {
        res.status(403).send('Invalid access request');
    }
})
app.delete('/api/all', async(req,res)=>{
    const { credentials } = req.body;

    if (credentials === process.env.DB_SK) {
        try {
            // delete ALL entries
            // subject, exitInterview, trial, quiz, demographics
            trial.destroy({ where: {},truncate:{cascade:true} });
            subject.destroy({ where: {},truncate:{cascade:true} });
            exitInterview.destroy({ where: {},truncate:{cascade:true} });
            quiz.destroy({ where: {},truncate:{cascade:true} });
            demographics.destroy({ where: {},truncate:{cascade:true} });
            return res.status(200).send({ msg: "DB Successfully flushed" })
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    } else {
        res.status(403).send('Invalid access request');
    }
})
app.delete('/api/subject', async (req, res) => {
    const { subjectId, credentials } = req.body;
    if (credentials === process.env.DB_SK) {
        try {
            // delete all entries from user
            await subject.destroy({ where: { id: subjectId } });

            return res.status(200).send({ msg: "Subject Successfully Removed" })
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    }
});

//============ DOWNLOAD ROUTES =============
app.post('/data/subject', async (req, res) => {
    const credentials = req.body.credentials;

    if (credentials === process.env.DB_SK) {
        try {
            let ServerData = await subject.findAll();

            if (ServerData) {
                return res.status(200).json({ ServerData })
            }

        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    } else {
        res.status(500).send('Not authorized for this route')
    }
});
app.post('/data/trial', async (req, res) => {
    const credentials = req.body.credentials;

    if (credentials === process.env.DB_SK) {
        try {
            let ServerData = await trial.findAll();
            if (ServerData) {
                return res.status(200).json({ ServerData })
            }
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    } else {
        res.status(500).send('Not authorized for this route')
    }
})
app.post('/data/demographics', async (req, res) => {
    const credentials = req.body.credentials;

    if (credentials === process.env.DB_SK) {
        try {
            let ServerData = await demographics.findAll();

            if (ServerData) {
                return res.status(200).json({ ServerData })
            }
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    } else {
        res.status(500).send('Not authorized for this route')
    }
})
app.post('/data/exit', async (req, res) => {
    const credentials = req.body.credentials;

    if (credentials === process.env.DB_SK) {
        try {
            let ServerData = await exitInterview.findAll();

            if (ServerData) {
                return res.status(200).json({ ServerData })
            }
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    } else {
        res.status(500).send('Not authorized for this route')
    }
})
// this returns only the subjects with exit interview
app.post('/data/exit/subjects', async (req, res) => {
    const credentials = req.body.credentials;

    if (credentials === process.env.DB_SK) {
        try {
            let dataToSynthesize = await exitInterview.findAll({
                where: { subjectId: { [Op.ne]: null } },
                attributes: ['id'],
                include: {
                    model: subject,
                    attributes: ['firstName', 'lastName', 'email']
                }
            });

            if (dataToSynthesize) {
                let ServerData = dataToSynthesize.map(person => ({
                    exitInterviewID: person.id,
                    firstName: person.subject.firstName,
                    lastName: person.subject.lastName,
                    email: person.subject.email
                }))
                return res.status(200).json({ ServerData })
            }
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    } else {
        res.status(500).send('Not authorized for this route')
    }
})
app.post('/data/disqualifiedAbandoned', async (req, res) => {
    const credentials = req.body.credentials;

    if (credentials === process.env.DB_SK) {
        try {
            let ServerData = await exitInterview.findAll({ where: { aborted: true } });

            if (ServerData) {
                return res.status(200).json({ ServerData })
            }
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    } else {
        res.status(500).send('Not authorized for this route')
    }
})
app.post('/data/disqualifiedReloaded', async (req, res) => {
    const credentials = req.body.credentials;

    if (credentials === process.env.DB_SK) {
        try {
            let ServerData = await trial.findAll({ where: { refreshedPage: true } });

            if (ServerData) {
                return res.status(200).json({ ServerData })
            }
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    } else {
        res.status(500).send('Not authorized for this route')
    }
})
app.post('/data/quiz', async (req, res) => {
    const credentials = req.body.credentials;

    if (credentials === process.env.DB_SK) {
        try {
            let ServerData = await quiz.findAll();

            if (ServerData) {
                return res.status(200).json({ ServerData })
            }
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    } else {
        res.status(500).send('Not authorized for this route')
    }
})

// ---SERVE STATIC ASSETS FOR PRODUCTION AND DEV-----
if (process.env.NODE_ENV === "production") {

    // static folder to server
    app.use(express.static(path.resolve(__dirname, "build")))
    app.use(express.static(path.resolve(__dirname, "public")))

    // page to return if anything that doesn't exist.
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "public", "index.html"));
    })

} else {
    app.use(express.static(path.resolve(__dirname, "public")))
}


// ----------------TEST CONNECTION------------------
sequelize
    .authenticate()
    .then(() => {
        console.log("Connection has been established successfully.");
    })
    .then(() => { })
    .catch(err => {
        console.error("Unable to connect to the database:", err);
    });

// UNCOMMENT TO FLUSH DB
sequelize.sync({ force: true });

// // //-------------------GET PORT TO LISTEN ON-----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`running server on port ${PORT}`));