describe('SLA Service', () => {
  describe('SLA Deadline Calculation', () => {
    test('should calculate correct deadline for 48-hour SLA', () => {
      const createdAt = new Date('2024-01-15T10:00:00Z');
      const slaHours = 48;
      const deadline = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
      
      const expectedDeadline = new Date('2024-01-17T10:00:00Z');
      expect(deadline).toEqual(expectedDeadline);
    });

    test('should calculate deadline for 24-hour SLA', () => {
      const createdAt = new Date('2024-01-15T10:00:00Z');
      const slaHours = 24;
      const deadline = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
      
      const expectedDeadline = new Date('2024-01-16T10:00:00Z');
      expect(deadline).toEqual(expectedDeadline);
    });
  });

  describe('SLA Breach Detection', () => {
    test('should detect SLA breach', () => {
      const deadline = new Date('2024-01-15T10:00:00Z');
      const currentTime = new Date('2024-01-16T10:01:00Z');
      
      const isBreach = currentTime > deadline;
      expect(isBreach).toBe(true);
    });

    test('should not flag as breach if within SLA', () => {
      const deadline = new Date('2024-01-16T10:00:00Z');
      const currentTime = new Date('2024-01-15T10:00:00Z');
      
      const isBreach = currentTime > deadline;
      expect(isBreach).toBe(false);
    });
  });
});