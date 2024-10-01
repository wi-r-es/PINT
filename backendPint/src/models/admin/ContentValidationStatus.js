module.exports = (sequelize, DataTypes) => {
    const ContentValidationStatus = sequelize.define('ContentValidationStatus', {
        content_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        content_type: { type: DataTypes.STRING(50), allowNull: false },
        content_status: { type: DataTypes.STRING(50), defaultValue: 'Pending' },
        validation_date: { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        content_real_id: { type: DataTypes.INTEGER, allowNull: false },
        validator_id: { type: DataTypes.INTEGER }
    }, {
        schema: 'admin',
        tableName: 'content_validation_status',
        timestamps: false
    });

    ContentValidationStatus.associate = function(models) {
        ContentValidationStatus.belongsTo(models.Users, { foreignKey: 'validator_id', targetKey: 'user_id', schema: 'hr', onDelete: 'SET NULL' });
    };

    return ContentValidationStatus;
};
