module.exports = (sequelize, DataTypes) => {
    const UserPasswordsDictionaryHistory = sequelize.define('UserPasswordsDictionaryHistory', {
        user_id: { type: DataTypes.INTEGER },
        hashed_passwd: { type: DataTypes.STRING(255), allowNull: false },
        salt: { type: DataTypes.STRING(255), allowNull: false },
        valid_from: { type: DataTypes.DATE, allowNull: false },
        valid_to: { type: DataTypes.DATE, allowNull: false }
    }, {
        schema: 'security',
        tableName: 'user_passwords_dictionary_history',
        timestamps: false
    });

    return UserPasswordsDictionaryHistory;
};
