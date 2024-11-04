import pool from '../db.js'; 
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const checkUser = (req, res, next) => {
    res.locals.user = req.session?.user || null;
    next();
};

export const createUser = async (req, res, next) => {
    const { login, email, password, confirm_password } = req.body || {};

    if (login && 
        email && 
        password && 
        confirm_password && 
        password === confirm_password) {
        try {
            const [existingUser] = await pool.execute(
                'SELECT * FROM users WHERE login = ? OR email = ?',
                [login, email]
            );

            if (existingUser.length === 0) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(password, salt);

                await pool.execute(
                    'INSERT INTO users (login, email, password) VALUES (?, ?, ?)',
                    [login, email, hash]
                );

                return next();
            } else {
                
                return res.status(400).redirect('/');
            }
        } catch (error) {
            console.error('Database error:', error);
            return res.status(500).send('Server error');
        }
    }
    res.status(400).redirect('/');
};

export const authUser = async (req, res, next) => {
    const { login, password } = req.body || {};

    try {
        const [user] = await pool.execute(
            'SELECT * FROM users WHERE login = ?',
            [login]
        );

        if (user.length > 0 && bcrypt.compareSync(password, user[0].password)) {
            req.body.email = user[0].email;
            return next();
        }

        res.status(400).redirect('/');
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).send('Server error');
    }
};

export const feedbackUser = async (req, res, next) => {
    const { email, subject, message } = req.body || {};

    if (email && subject && message) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: message,
        };

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: true,
                minVersion: "TLSv1.2",
            },
        });

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log("Email sent:", info);
            return res.status(201).redirect("/");
        } catch (error) {
            console.error("Error sending email:", error);
            return res.status(500).redirect("/");
        }
    }
    next();
};

export const getUserPhoto = async (login) => {
    try {
        const [user] = await pool.execute(
            'SELECT photo FROM users WHERE login = ?',
            [login]
        );
        return user.length > 0 ? user[0].photo : null;
    } catch (error) {
        console.error('Database error:', error);
        return null;
    }
};
