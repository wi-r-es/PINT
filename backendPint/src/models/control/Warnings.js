module.exports = (sequelize, DataTypes) => {
    const Warnings = sequelize.define('Warnings', {
        warning_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        warning_level: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        state: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        creation_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        admin_id: { type: DataTypes.INTEGER, allowNull: false },
        office_id: { type: DataTypes.INTEGER, allowNull: false }
    }, {
        schema: 'control',
        tableName: 'warnings',
        timestamps: false
    });

    Warnings.associate = function(models) {
        Warnings.belongsTo(models.Users, { foreignKey: 'admin_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
        Warnings.belongsTo(models.OfficeAdmins, { foreignKey: 'office_id', targetKey: 'office_id', schema: 'centers' });
    };

    return Warnings;
};
