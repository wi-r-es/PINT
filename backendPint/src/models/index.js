const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
const sequelize = require('../database/db'); // Ensure correct path

const db = {};
const modelDir = path.join(__dirname);

// Function to recursively read model files
const readModels = (dir) => {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            readModels(fullPath);
        } else if (file.endsWith('.js') && file !== 'index.js') {
            const model = require(fullPath)(sequelize, DataTypes);
            db[model.name] = model;
            console.log(`Imported model: ${model.name}`);
        }
    });
};

// Read models from the models directory
readModels(modelDir);

// Associate models if needed
/*
const associateModels = () => {
    Object.keys(db).forEach(modelName => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
            console.log(`Associated model: ${modelName}`);
        }
    });
};
*/
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
        console.log(`Associated model: ${modelName}`);
    }
});

/*
const syncDatabase = async () => {
    try {
        await sequelize.sync();
        console.log('Database synchronized successfully');
    } catch (error) {
        console.error('Error synchronizing the database:', error);
        throw error;
    }
};
*/

//sequelize.sync();
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
/*
module.exports = {
    db,
    syncDatabase,
    readModels,
    associateModels
};

*/
