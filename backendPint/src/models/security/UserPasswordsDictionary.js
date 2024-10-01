const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

module.exports = (sequelize, DataTypes) => {
    const UserPasswordsDictionary = sequelize.define('UserPasswordsDictionary', {
        user_id: { type: DataTypes.INTEGER},
        hashed_password: { type: DataTypes.STRING(255), allowNull: false },
       // salt: { type: DataTypes.STRING(255), allowNull: true },
        valid_from: { type: DataTypes.DATE, allowNull: true, defaultValue: new Date() },
        valid_to: { type: DataTypes.DATE, allowNull:true, defaultValue: addMonths(new Date(), 6)}
    }, {
        schema: 'security',
        tableName: 'user_passwords_dictionary',
        timestamps: false,

    });
    UserPasswordsDictionary.associate = function(models) {
        UserPasswordsDictionary.belongsTo(models.Users, {as: 'User', foreignKey: 'user_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
    };

    return UserPasswordsDictionary;
};
