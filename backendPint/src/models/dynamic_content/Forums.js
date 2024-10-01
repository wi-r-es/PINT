module.exports = (sequelize, DataTypes) => {
    const Forums = sequelize.define('Forums', {
        forum_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        publisher_id: { type: DataTypes.INTEGER, allowNull: false },
        office_id: { type: DataTypes.INTEGER, allowNull: false },
        admin_id: { type: DataTypes.INTEGER },
        sub_area_id: { type: DataTypes.INTEGER },
        creation_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        title: { type: DataTypes.STRING(255), allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: false},
        event_id: { type: DataTypes.INTEGER },
        validated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        forum_status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    }, {
        schema: 'dynamic_content',
        tableName: 'forums',
        timestamps: false
    });

    Forums.associate = function(models) {
        Forums.belongsTo(models.OfficeAdmins, {as: 'Office_admin', foreignKey: 'office_id', targetKey: 'office_id', schema: 'centers', onDelete: 'CASCADE' });
        Forums.belongsTo(models.Offices, {as: 'Office', foreignKey: 'office_id', targetKey: 'office_id', schema: 'centers', onDelete: 'CASCADE' });
        Forums.belongsTo(models.SubArea, { foreignKey: 'sub_area_id', targetKey: 'sub_area_id', schema: 'static_content' });
        Forums.belongsTo(models.Users, { as: 'Publisher', foreignKey: 'publisher_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
        Forums.belongsTo(models.Users, { as: 'Admin', foreignKey: 'admin_id', targetKey: 'user_id', schema: 'hr' , onDelete: 'CASCADE'});
        Forums.belongsTo(models.Events, { foreignKey: 'event_id', targetKey: 'event_id', schema: 'dynamic_content', onDelete: 'CASCADE' });
    };

    return Forums;
};
