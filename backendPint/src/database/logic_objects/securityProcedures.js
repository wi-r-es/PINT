const { QueryTypes } = require('sequelize');
const { logError} = require('./generalHelpers');
const { logUserAction} = require('./usersProcedures');
const { sendMail } = require('../../controllers/emailController');
const PasswordReuseError = require('../../errors/passwordReuseError');
const bcrypt = require('bcryptjs');
const db = require('../../models'); 

const sp_findUserById = async (userId) => {
  try {
      const [user] = await db.sequelize.query(
          `SELECT hr."user_id", hr."first_name", hr."last_name", hr."email", hr."last_access", hr."profile_pic", oa."office_id"
           FROM "hr"."users" hr
           LEFT JOIN "centers"."office_workers" oa ON hr."user_id" = oa."user_id"
           WHERE hr."user_id" = :userId`,
          {
              replacements: { userId },
              type: QueryTypes.SELECT
          }
      );

      return user;
  } catch (error) {
      throw error;
  }
};


const spCreatePassword = async (userId, Password) => {
  const transaction = await db.sequelize.transaction();
  try {
    const hashedPassword = await bcrypt.hash(Password, 12);


    await db.sequelize.query(
      `UPDATE "hr"."users" SET "hashed_password" = :hashedPassword WHERE "user_id" = :userId`,
      {
        replacements: { hashedPassword, userId },
        type: QueryTypes.UPDATE
      }
    );

    const user = await sp_findUserById(userId);

    await db.sequelize.query(
      `INSERT INTO "security"."user_passwords_dictionary" ("user_id", "hashed_password")
        VALUES (:userId, :hashedPassword)`,
        {
          replacements: { userId, hashedPassword },
          type: QueryTypes.INSERT
        }
      );

    await sendMail({
      to: user.email,
      subject: 'SOFTSHARES - Account Status',
      body: 'Your password has been set successfully! Please await for your account to be activated by an admin! You will receive the update by email! Thank you for your patiente!'
    });

    await transaction.commit();
  }catch (error) {
    await transaction.rollback();
    logError(error);
    throw error;
  }
};


const spAssignUserToCenter = async (userId, centerId, transaction) => {
    try {
      const exists = await db.sequelize.query(
        `SELECT 1 FROM "centers"."office_workers" WHERE "user_id" = :userId AND "office_id" = :centerId`,
        {
          replacements: { userId, centerId },
          type: QueryTypes.SELECT,
          transaction
        }
      );
  
      if (!exists.length) {
        await db.sequelize.query(
          `INSERT INTO "centers"."office_workers" ("user_id", "office_id")
           VALUES (:userId, :centerId)`,
          {
            replacements: { userId, centerId },
            type: QueryTypes.INSERT,
            transaction
          }
        );
      } else {
        throw new Error('User is already assigned to this center.');
      }
  
      // await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
};

const spSendWelcomeEmail = async (email) => {
    try {
      sendMail({
        to: email,
        subject: 'Welcome to SoftShares!',
        body: `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="text-align: center; color: #00c2ff;">Welcome to SoftShares!</h2>
            <p>Welcome to the team! We are thrilled to have you on board at SoftShares. Your journey with us is just beginning, and we look forward to achieving great things together.</p>
            <p>As part of our team, you’ll play a key role in helping us drive success and innovation. We’re confident that your skills and talents will be a great addition to our collective efforts.</p>
            <p>If you have any questions or need assistance as you settle in, feel free to reach out to your team members or HR. We are here to support you every step of the way.</p>
            <p>Once again, welcome to SoftShares. Let’s make great things happen!</p>
            <p>Best Regards,<br>The Softinsa Team</p>
          </div>
        `,
      });
      
    } catch (error) {
      throw error;
    }
};

const spRegisterNewUser = async (firstName, lastName, email, centerId, profilePic = null) => {
    const transaction = await db.sequelize.transaction();
    try {
      const [result] = await db.sequelize.query(
        `INSERT INTO "hr"."users" ("first_name", "last_name", "email", "profile_pic", "join_date")
         VALUES (:firstName, :lastName, :email, :profilePic, NOW())
         RETURNING "user_id"`,
        {
          replacements: { firstName, lastName, email, profilePic },
          type: QueryTypes.INSERT,
          transaction
        }
      );
      
      const res = await db.sequelize.query(
        `SELECT "user_id" FROM "hr"."users" WHERE "email" = :email`,
        {
          replacements: { email },
          type: QueryTypes.SELECT,
          transaction
        }
      )
      console.log(res); 
      const userId = result[0].user_id;
  
      await db.sequelize.query(
        `INSERT INTO "security"."user_account_details" ("user_id", "account_status", "account_restriction")
         VALUES (:userId, false, false)`,
        {
          replacements: { userId },
          type: QueryTypes.INSERT,
          transaction
        }
      );
  
      await spAssignUserToCenter(userId, centerId, transaction);
  
      await sendMail({
        to: email,
        subject: 'SOFTSHARES - Account Creation',
        body: `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="text-align: center; color: #00c2ff;">Welcome to SOFTSHARES!</h2>
            <p>Hello,</p>
            <p>We are excited to inform you that your account has been successfully created. We’re thrilled to have you on board.</p>
            <p><strong>Next Steps:</strong></p>
            <p>Keep an eye on your inbox—soon, you’ll receive an email containing a link to set up your password. Follow the instructions in the email to complete your account setup.</p>
            <p>If you did not create an account with SOFTSHARES, please disregard this email.</p>
            <p>Thank you for joining us! We look forward to providing you with a seamless and productive experience.</p>
            <p>Best regards,<br>The Softinsa Team</p>
          </div>
        `,
      });
      
  
      await spSendWelcomeEmail(email);
  
      await transaction.commit();
      return res;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
};



const spChangeUserPassword = async (userId, newPassword) => {
  const transaction = await db.sequelize.transaction();
  try {
      // Retrieve previous salts
      const previousPasswords = await db.sequelize.query(
          `SELECT hashed_password FROM "security"."user_passwords_dictionary"
           WHERE "user_id" = :userId`,
          {
              replacements: { userId },
              type: QueryTypes.SELECT,
              transaction
          }
      );
      console.log('Previous paswrdsL:  ');
      console.log(previousPasswords);

      // Check if the new password is the same as any previous hashed passwords
      for (const prev of previousPasswords) {
        const isMatch = await bcrypt.compare(newPassword, prev.hashed_password);
        if (isMatch) {
            throw new PasswordReuseError('The new password must not be the same as any previously used passwords.');
        }
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);


      // Update the current password table
      await db.sequelize.query(
        `UPDATE "hr"."users" SET "hashed_password" = :hashedPassword WHERE "user_id" = :userId`,
        {
          replacements: { hashedPassword, userId },
          type: QueryTypes.UPDATE
        }
      );
      // INSERT NEW PASSWD INTO THE DIC
      await db.sequelize.query(
        `INSERT INTO "security"."user_passwords_dictionary" ("user_id", "hashed_password")
          VALUES (:userId, :hashedPassword)`,
          {
            replacements: { userId, hashedPassword },
            type: QueryTypes.INSERT
          }
        );


      // // Send email notification
      // await sendMail({
      //     to: user.email,  // assuming user email is available
      //     subject: 'SOFTSHARES - Account Action - Password Changes',
      //     body: 'This email serves as a notification for successful account password modification. If you did not take this action, please inform your security team right away!'
      // });

      // Log the user action
      await logUserAction(userId, 'PASSWORD CHANGE', 'Changed account password', transaction);

      await transaction.commit();
  } catch (error) {
      await transaction.rollback();
      throw error;
  }
};

  

const spDeactivateUser = async (userId) => {
    const transaction = await db.sequelize.transaction();
    try {
      await db.sequelize.query(
        `UPDATE "security"."user_account_details" SET "account_status" = false WHERE "user_id" = :userId`,
        {
          replacements: { userId },
          type: QueryTypes.UPDATE,
          transaction
        }
      );
  
      const [user] = await db.sequelize.query(
        `SELECT "email" FROM "hr"."users" WHERE "user_id" = :userId`,
        {
          replacements: { userId },
          type: QueryTypes.SELECT,
          transaction
        }
      );
  
      if (user && user.email) {
        await sendMail({
          to: user.email,
          subject: 'SOFTSHARES - Account Status Change',
          body: 'This email serves to inform you that your Softshares account has been deactivated.'
        });
      }
  
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
};

const spDeleteUser = async (userId) => {
  const transaction = await db.sequelize.transaction();
  try {
        // Delete the user by user_id
        await db.sequelize.query(
          `
          DELETE FROM "hr"."users"
          WHERE "user_id" = :userId
          `,
          {
            replacements: { userId },
            type: QueryTypes.DELETE,
            transaction,
          }
        );
    

    await transaction.commit();
    console.log(`User with ID ${userId} successfully deleted.`);
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting user:', error.message);
    throw error;
  }
};
  //to set route
const spActivateUser = async (userId) => {
    const transaction = await db.sequelize.transaction();
    try {
      await db.sequelize.query(
        `UPDATE "security"."user_account_details" SET "account_status" = true WHERE "user_id" = :userId`,
        {
          replacements: { userId },
          type: QueryTypes.UPDATE,
          transaction
        }
      );
      
  
      const [user] = await db.sequelize.query(
        `SELECT "email" FROM "hr"."users" WHERE "user_id" = :userId`,
        {
          replacements: { userId },
          type: QueryTypes.SELECT,
          transaction
        }
      );
  
      if (user && user.email) {
        await sendMail({
          to: user.email,
          subject: 'SOFTSHARES - Account Status Change',
          body: 'This email serves to inform you that your Softshares account has been activated.'
        });
      }
  
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
};
  

//to set route
const spSetCenterAdmin = async (userId, officeId) => {
  var _role_id;
    const transaction = await db.sequelize.transaction();
    try {
      const [userExists] = await db.sequelize.query(
        `SELECT 1 FROM "hr"."users" WHERE "user_id" = :userId`,
        {
          replacements: { userId },
          type: QueryTypes.SELECT,
          transaction
        }
      );
  
      if (!userExists) {
        throw new Error(`UserID ${userId} does not exist.`);
      }
  
      const [officeExists] = await db.sequelize.query(
        `SELECT 1 FROM "centers"."offices" WHERE "office_id" = :officeId`,
        {
          replacements: { officeId },
          type: QueryTypes.SELECT,
          transaction
        }
      );
  
      if (!officeExists) {
        throw new Error(`OFFICE_ID ${officeId} does not exist.`);
      }
  
      await db.sequelize.query(
        `INSERT INTO "centers"."office_admins" ("office_id", "manager_id")
         VALUES (:officeId, :userId)`,
        {
          replacements: { officeId, userId },
          type: QueryTypes.INSERT,
          transaction
        }
      );
      if( officeId === 0){
        _role_id = 3;
      } else _role_id = 2;
      await db.sequelize.query(
        `UPDATE "hr"."users" SET "role_id" = :_role_id WHERE "user_id" = :userId`,
        {
          replacements: { _role_id, userId },
          type: QueryTypes.UPDATE,
          transaction
        }
      );
  
      console.log(`UserID ${userId} has been set to admin to ${officeId}.`);
  
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
};

const spCheckPasswordExpiry = async () => {
    try {
      await db.sequelize.query(
        `INSERT INTO "security"."passwd_expiring_notifications" ("user_id", "notif_date")
         SELECT "user_id", NOW()
         FROM "security"."user_passwords_dictionary"
         WHERE "valid_to" = CURRENT_DATE + INTERVAL '7 days'
           AND "user_id" NOT IN (
             SELECT "user_id" FROM "security"."passwd_expiring_notifications" WHERE "is_notified" = 0
           )`,
        {
          type: QueryTypes.INSERT
        }
      );
    } catch (error) {
      throw error;
    }
};

const spSendPasswordExpiryNotification = async (email) => {
    try {
      const subject = 'Password Expiry Notification';
      const content = 'Your password is set to expire in 7 days. Please update your password to ensure uninterrupted access to your account.';
  
      await sendMail({
        to: email,
        subject,
        text: content
      });
  
      console.log(`Email sent to ${email}`);
    } catch (error) {
      throw error;
    }
};

const sp_findUserByEmail = async (email) => {
    try {
        const [user] = await db.sequelize.query(
            `SELECT * 
             FROM "hr"."users" 
             WHERE "email" = :email`,
            {
                replacements: { email },
                type: QueryTypes.SELECT
            }
        );
        console.log(user);
        return user;
    } catch (error) {
        throw error;
    }
};


  
  

module.exports = {
    sp_findUserByEmail,
    sp_findUserById,
    spAssignUserToCenter,
    spSendWelcomeEmail,
    spRegisterNewUser,
    //spCreateUserPassword,
    spChangeUserPassword,
    spDeactivateUser,
    spActivateUser,
    spSetCenterAdmin,
    spCheckPasswordExpiry,
    spSendPasswordExpiryNotification,
    spCreatePassword,
    spDeleteUser
}