const db = require("../../../models");

const createTable_forDEBUG = async () => {
  await db.sequelize.query(`
    CREATE TABLE admin.trigger_audit (
    audit_id SERIAL PRIMARY KEY,
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content_type TEXT,
    content_real_id INT,
    operation TEXT
                );
  `);
};

// const createTrigger_forDEBUG = async () => {
//   await db.sequelize.query(`
   
    
//   `);
// };

module.exports = {
    createTable_forDEBUG,
 // createTrigger_notifyServer,
};
