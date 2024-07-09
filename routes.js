const express = require('express');
const pool = require('./database');
const router = express.Router();

router.get('/getVendorUsers', async (req, res) => {
    const { prId, custOrgId } = req.query;

    if (!prId || !custOrgId) {
        return res.status(400).json({ error: 'prId and custOrgId are required' });
    }

    try {
        const query = `
            SELECT vu.VendorOrganizationId as supplierId, vu.UserName, vu.Name
            FROM PrLineItems pli
            JOIN VendorUsers vu ON FIND_IN_SET(vu.VendorOrganizationId, pli.suppliers) > 0
            WHERE pli.purchaseRequestId = 'your_prId' AND pli.custOrgId = 'your_custOrgId' AND vu.Role = 'Admin'
            GROUP BY vu.VendorOrganizationId, vu.UserName, vu.Name;

        `;

        const [rows] = await pool.execute(query, [prId, custOrgId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No matching records found' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
