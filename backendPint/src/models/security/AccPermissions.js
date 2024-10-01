module.exports = (sequelize, DataTypes) => {
    const AccPermissions = sequelize.define('AccPermissions', {
        role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        role_name: { type: DataTypes.STRING(50) },
        role_level: { type: DataTypes.INTEGER }
    }, {
        schema: 'security',
        tableName: 'acc_permissions',
        timestamps: false
    });
    return AccPermissions;
};
