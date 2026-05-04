const db = require('../config/db');
const notificationService = require("./notificationService");

class CreditService {
    async submitPaymentProof(userId, data) {
        const { amount, referenceNumber, imagePath } = data;
        
        // Check if reference number already exists
        const existing = await db('payment_proofs').where({ reference_number: referenceNumber }).first();
        if (existing) {
            throw new Error('Reference number already submitted');
        }

        const [id] = await db('payment_proofs').insert({
            user_id: userId,
            amount,
            reference_number: referenceNumber,
            image_path: imagePath,
            status: 'pending'
        });

        return db('payment_proofs').where({ id }).first();
    }

    async approvePaymentProof(proofId, adminId, notes) {
        const trx = await db.transaction();
        try {
            const proof = await trx('payment_proofs').where({ id: proofId }).first();
            if (!proof) throw new Error('Payment proof not found');
            if (proof.status !== 'pending') throw new Error('Proof is already processed');

            // 1. Update proof status
            await trx('payment_proofs').where({ id: proofId }).update({
                status: 'approved',
                admin_id: adminId,
                admin_notes: notes,
                updated_at: db.fn.now()
            });

            // 2. Add credits to user balance
            await trx('users').where({ id: proof.user_id }).increment('balance', proof.amount);

            // 3. Log credit transaction
            await trx('credit_transactions').insert({
                user_id: proof.user_id,
                amount: proof.amount,
                type: 'topup',
                payment_proof_id: proofId,
                description: `Top-up from approved payment proof #${proof.reference_number}`
            });

            await notificationService.createNotification(
                proof.user_id,
                {
                    type: "success",
                    title: "Credits approved",
                    message: `${proof.amount} credits were added to your account from payment proof #${proof.reference_number}.`,
                },
                trx,
            );

            // 4. Log audit event
            await trx('audit_logs').insert({
                user_id: adminId,
                action: 'APPROVE_PAYMENT',
                details: `Approved proof #${proofId} for user ${proof.user_id}`
            });

            await trx.commit();
            return { success: true };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    async rejectPaymentProof(proofId, adminId, notes) {
        const trx = await db.transaction();
        try {
            const proof = await trx('payment_proofs').where({ id: proofId }).first();
            if (!proof) throw new Error('Payment proof not found');
            if (proof.status !== 'pending') throw new Error('Proof is already processed');

            await trx('payment_proofs').where({ id: proofId }).update({
                status: 'rejected',
                admin_id: adminId,
                admin_notes: notes,
                updated_at: db.fn.now()
            });

            await notificationService.createNotification(
                proof.user_id,
                {
                    type: "error",
                    title: "Payment proof rejected",
                    message: notes
                        ? `Your payment proof #${proof.reference_number} was rejected. Note: ${notes}`
                        : `Your payment proof #${proof.reference_number} was rejected.`,
                },
                trx,
            );

            await trx('audit_logs').insert({
                user_id: adminId,
                action: 'REJECT_PAYMENT',
                details: `Rejected proof #${proofId} for user ${proof.user_id}`
            });

            await trx.commit();
            return { success: true };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
}

module.exports = new CreditService();
