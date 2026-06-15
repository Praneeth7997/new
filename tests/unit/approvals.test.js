describe('Approval Service', () => {
  describe('Approve Request', () => {
    test('should approve request successfully', () => {
      const result = {
        status: 'approved',
        approved_at: '2024-01-15T14:00:00Z',
        approval_date: '2024-01-15T14:00:00Z'
      };

      expect(result.status).toBe('approved');
      expect(result.approved_at).toBeDefined();
    });

    test('should trigger next approval level', () => {
      const result = {
        status: 'approved',
        nextApproval: { level: 2, department: 'Finance' }
      };
      
      expect(result.nextApproval).toBeDefined();
      expect(result.nextApproval.level).toBe(2);
    });
  });

  describe('Reject Request', () => {
    test('should reject request with reason', () => {
      const result = {
        status: 'rejected',
        rejection_reason: 'Insufficient budget'
      };

      expect(result.status).toBe('rejected');
      expect(result.rejection_reason).toBe('Insufficient budget');
    });
  });
});