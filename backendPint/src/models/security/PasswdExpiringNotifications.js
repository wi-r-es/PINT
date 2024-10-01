module.exports = (sequelize, DataTypes) => {
    const PasswdExpiringNotifications = sequelize.define('PasswdExpiringNotifications', {
        notification_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        notif_date: { type: DataTypes.DATE, allowNull: false },
        is_notified: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {
        schema: 'security',
        tableName: 'passwd_expiring_notifications',
        timestamps: false
    });

    PasswdExpiringNotifications.associate = function(models) {
        PasswdExpiringNotifications.belongsTo(models.Users, { foreignKey: 'user_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
    };

    return PasswdExpiringNotifications;
};
