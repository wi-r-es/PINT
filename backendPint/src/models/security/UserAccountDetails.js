module.exports = (sequelize, DataTypes) => {
    const UserAccountDetails = sequelize.define('UserAccountDetails', {
        user_id: { type: DataTypes.INTEGER, primaryKey: true },
        account_status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        account_restriction: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    }, {
        schema: 'security',
        tableName: 'user_account_details',
        timestamps: false
    });

    UserAccountDetails.associate = function(models) {
        UserAccountDetails.belongsTo(models.Users, { foreignKey: 'user_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
    };

    return UserAccountDetails;
};
