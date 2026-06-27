import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/prisma';

const router = Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        aadharNumber: true,
        panNumber: true,
        income: true,
        occupation: true,
        education: true,
        familySize: true,
        disability: true,
        veteranStatus: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', 
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('phone').optional().isString(),
  body('email').optional().isEmail(),
  body('address').optional().isString(),
  body('city').optional().isString(),
  body('state').optional().isString(),
  body('pincode').optional().isString(),
  body('income').optional({ checkFalsy: true }).isNumeric(),
  body('occupation').optional().isString(),
  body('education').optional().isString(),
  body('familySize').optional({ checkFalsy: true }).isInt(),
  body('aadharNumber').optional().isString(),
  body('panNumber').optional().isString(),
  body('disability').optional().isString(),
  body('veteranStatus').optional().isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Explicitly extract allowed fields to prevent arbitrary data updates
      const allowedFields = [
        'firstName', 'lastName', 'phone', 'email', 'address', 'city', 
        'state', 'pincode', 'aadharNumber', 'panNumber', 'income', 
        'occupation', 'education', 'familySize', 'disability', 'veteranStatus'
      ];
      
      const updateData: any = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      // Normalize email if updated
      if ('email' in updateData && typeof updateData.email === 'string') {
        updateData.email = updateData.email.trim().toLowerCase();
      }
      
      // Handle numeric conversions for Prisma
      if ('income' in updateData) {
        updateData.income = updateData.income === '' ? null : Number(updateData.income);
      }
      if ('familySize' in updateData) {
        updateData.familySize = updateData.familySize === '' ? null : Number(updateData.familySize);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      res.json(updatedUser);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email is already in use' });
      }
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

// Get user eligibility checks
router.get('/eligibility', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const eligibilityChecks = await prisma.eligibilityCheck.findMany({
      where: { userId },
      include: {
        scheme: {
          select: {
            id: true,
            name: true,
            category: true,
            department: true
          }
        }
      },
      orderBy: { checkedAt: 'desc' }
    });

    const parsed = eligibilityChecks.map((check) => ({
      ...check,
      matchedCriteria: (() => {
        try { return check.matchedCriteria ? JSON.parse(check.matchedCriteria) : []; } catch { return []; }
      })(),
      unmatchedCriteria: (() => {
        try { return check.unmatchedCriteria ? JSON.parse(check.unmatchedCriteria) : []; } catch { return []; }
      })()
    }));

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch eligibility checks' });
  }
});

export default router;
