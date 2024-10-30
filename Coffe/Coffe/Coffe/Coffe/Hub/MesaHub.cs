using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

public class MesaHub : Hub
{
    public async Task EnviarActualizacionMesas()
    {
        await Clients.All.SendAsync("mesasActualizadas");   
    }
}