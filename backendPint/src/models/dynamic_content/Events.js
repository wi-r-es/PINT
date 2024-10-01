module.exports = (sequelize, DataTypes) => {
    const Events = sequelize.define('Events', {
        event_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        publisher_id: { type: DataTypes.INTEGER, allowNull: false },
        office_id: { type: DataTypes.INTEGER, allowNull: false },
        sub_area_id: { type: DataTypes.INTEGER, allowNull: false },
        admin_id: { type: DataTypes.INTEGER },
        creation_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        name: { type: DataTypes.STRING(255), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        event_date: { type: DataTypes.DATE, allowNull: false },
        start_time: { type: DataTypes.TIME, allowNull: true},
        end_time: { type: DataTypes.TIME, allowNull: true},
        event_location: { type: DataTypes.STRING(255) },
        filepath: { type: DataTypes.TEXT },
        recurring: { type: DataTypes.BOOLEAN, allowNull: false },
        recurring_pattern: { type: DataTypes.JSONB },
        max_participants: { type: DataTypes.INTEGER },
        current_participants: { type: DataTypes.INTEGER, defaultValue: 1 },
        validated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    }, {
        schema: 'dynamic_content',
        tableName: 'events',
        timestamps: false
    });

    Events.associate = function(models) {
        Events.belongsTo(models.OfficeAdmins, {as: 'Office_admin', foreignKey: 'office_id', targetKey: 'office_id', schema: 'centers', onDelete: 'CASCADE' });
        Events.belongsTo(models.Offices, {as: 'Office', foreignKey: 'office_id', targetKey: 'office_id', schema: 'centers', onDelete: 'CASCADE' });
        Events.belongsTo(models.Users, { as: 'Publisher', foreignKey: 'publisher_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
        Events.belongsTo(models.Users, { as: 'Admin', foreignKey: 'admin_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
        Events.belongsTo(models.SubArea, { foreignKey: 'sub_area_id', targetKey: 'sub_area_id', schema: 'static_content' });
        Events.hasOne(models.Scores, { as: 'Score', foreignKey: 'event_id', targetKey: 'event_id', schema: 'dynamic_content', onDelete: 'CASCADE' });

    };

    return Events;
};
