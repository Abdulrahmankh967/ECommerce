namespace _2_Services.Interfaces
{
    public interface ICustomerAddressService
    {
        Task<List<CustomerAddressDto>> GetAddressesByCustomerAsync(int customerId);
        Task<CustomerAddressDto> GetAddressByIdAsync(int addressId, int customerId);
        Task<CustomerAddressDto> CreateAddressAsync(int customerId, CreateCustomerAddressDto dto);
        Task<CustomerAddressDto?> UpdateAddressAsync(int addressId, int customerId, UpdateCustomerAddressDto dto);
        Task<bool> DeleteAddressAsync(int addressId, int customerId);
    }
}
