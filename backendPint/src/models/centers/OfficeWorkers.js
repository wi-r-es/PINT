module.exports = (sequelize, DataTypes) => {
    const OfficeWorkers = sequelize.define('OfficeWorkers', {
        office_id: { type: DataTypes.INTEGER, primaryKey: true },
        user_id: { type: DataTypes.INTEGER, primaryKey: true }
    }, {
        schema: 'centers',
        tableName: 'office_workers',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['office_id', 'user_id']
            }
        ]
    });

    OfficeWorkers.associate = function(models) {
        OfficeWorkers.belongsTo(models.OfficeAdmins, { foreignKey: 'office_id', targetKey: 'office_id', schema: 'centers', onDelete: 'CASCADE' });
        OfficeWorkers.belongsTo(models.Offices, { foreignKey: 'office_id', targetKey: 'office_id', schema: 'centers', onDelete: 'CASCADE' });
        OfficeWorkers.belongsTo(models.Users, { foreignKey: 'user_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
    };

    return OfficeWorkers;
};
