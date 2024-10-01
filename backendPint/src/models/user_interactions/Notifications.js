module.exports = (sequelize, DataTypes) => {
    const Notifications = sequelize.define('Notifications', {
        notification_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        event_id: { type: DataTypes.INTEGER },
        post_id: { type: DataTypes.INTEGER },
        notification_text: { type: DataTypes.TEXT, allowNull: false },
        create_date: { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        is_read: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {
        schema: 'user_interactions',
        tableName: 'notifications',
        timestamps: false
    });

    Notifications.associate = function(models) {
        Notifications.belongsTo(models.Users, { foreignKey: 'user_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
    };

    return Notifications;
};
