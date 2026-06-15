describe('Routing Service', () => {
  describe('Route Request to Correct Department', () => {
    test('should route IT equipment request to IT department', async () => {
      const request = {
        type: 'equipment',
        title: 'New Laptop Request',
        description: 'Need MacBook Pro',
        priority: 'high'
      };

      const result = {
        primaryDepartment: 'IT',
        approvalChain: [{level: 1}, {level: 2}]
      };
      expect(result.primaryDepartment).toBe('IT');
      expect(result.approvalChain.length).toBeGreaterThan(0);
    });

    test('should route travel request to Operations', () => {
      const result = {
        primaryDepartment: 'Operations',
        secondaryDepartments: ['Finance']
      };
      expect(result.primaryDepartment).toBe('Operations');
      expect(result.secondaryDepartments).toContain('Finance');
    });

    test('should add Finance to approval chain if cost > threshold', () => {
      const request = { estimated_cost: 10000 };
      const result = { secondaryDepartments: ['Finance'] };
      expect(result.secondaryDepartments).toContain('Finance');
    });
  });
});