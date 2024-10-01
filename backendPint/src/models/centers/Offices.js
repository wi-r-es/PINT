
module.exports = (sequelize, DataTypes) => {
    const Offices = sequelize.define('Offices', {
        office_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        city: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        officeImage: { type: DataTypes.STRING(255), allowNull: true },
    }, {
        schema: 'centers',
        tableName: 'offices',
        timestamps: false
    });

    Offices.associate = function(models) {
        Offices.belongsTo(models.OfficeAdmins, { foreignKey: 'office_id', targetKey: 'office_id', schema: 'centers', onDelete: 'CASCADE' });
        Offices.belongsTo(models.OfficeWorkers, { foreignKey: 'office_id', targetKey: 'office_id', schema: 'centers', onDelete: 'CASCADE' });
        Offices.hasMany(models.Posts, { as: 'Posts', foreignKey: 'office_id', targetKey: 'office_id', schema: 'dynamic_content', onDelete: 'CASCADE' });
        Offices.hasMany(models.Forums, { as: 'Forums', foreignKey: 'office_id', targetKey: 'office_id', schema: 'dynamic_content', onDelete: 'CASCADE' });
        Offices.hasMany(models.Events, { as: 'Events', foreignKey: 'office_id', targetKey: 'office_id', schema: 'centedynamic_contentrs', onDelete: 'CASCADE' });
        
    };

    return Offices;
};
