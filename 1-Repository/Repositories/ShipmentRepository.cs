using _1_Repository.Data;
using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories
{
    public class ShipmentRepository : IShipmentRepository
    {
        private readonly AppDbContext _context;

        public ShipmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Shipment?> GetByOrderIdAsync(int orderId)
        {
            return await _context.Shipments
                .FirstOrDefaultAsync(s => s.OrderId == orderId);
        }

        public async Task<List<Shipment>> GetAllAsync()
        {
            return await _context.Shipments
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Shipment?> GetByIdAsync(int id)
        {
            return await _context.Shipments.FindAsync(id);
        }

        public async Task AddAsync(Shipment entity)
        {
            await _context.Shipments.AddAsync(entity);
        }

        public void Update(Shipment entity)
        {
            _context.Shipments.Update(entity);
        }

        public void Delete(Shipment entity)
        {
            _context.Shipments.Remove(entity);
        }
    }
}
