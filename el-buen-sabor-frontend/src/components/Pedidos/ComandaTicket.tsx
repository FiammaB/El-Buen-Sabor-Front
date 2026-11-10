import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO";

export interface ItemComanda {
    id?: number;
    denominacion?: string;
    cantidad?: number;
    preparacion?: string;
    observaciones?: string;
}

interface ComandaTicketProps {
    pedido: IPedidoDTO;
    items: ItemComanda[];
}

// Contenido de la comanda que se imprime. Está siempre en el DOM pero oculto
// (ver .comanda-print en App.css) — solo se vuelve visible durante la impresión.
export default function ComandaTicket({ pedido, items }: ComandaTicketProps) {
    return (
        <div className="comanda-print" style={{ fontFamily: "monospace", fontSize: "13px", padding: "8px" }}>
            <h2 style={{ textAlign: "center", margin: "0 0 4px" }}>EL BUEN SABOR</h2>
            <p style={{ textAlign: "center", fontWeight: "bold", margin: "0 0 8px" }}>Pedido #{pedido.id}</p>
            <hr />
            <p style={{ margin: "4px 0" }}>Fecha: {pedido.fechaPedido}</p>
            <p style={{ margin: "4px 0" }}>
                Entrega: {pedido.tipoEnvio === "DELIVERY" ? "Delivery" : "Retiro en local"}
            </p>
            {pedido.persona && (
                <p style={{ margin: "4px 0" }}>
                    Cliente: {pedido.persona.nombre} {pedido.persona.apellido}
                </p>
            )}
            <hr />
            {items.map((item, i) => (
                <div key={i} style={{ margin: "8px 0" }}>
                    <div style={{ fontWeight: "bold" }}>
                        {item.cantidad}x {item.denominacion}
                    </div>
                    {item.observaciones && (
                        <div style={{ fontSize: "12px", fontWeight: "bold" }}>*** {item.observaciones} ***</div>
                    )}
                    {item.preparacion && <div style={{ fontSize: "11px" }}>{item.preparacion}</div>}
                </div>
            ))}
            <hr />
            <p style={{ margin: "4px 0" }}>
                Hora estimada: {pedido.horaEstimadaFinalizacion ? pedido.horaEstimadaFinalizacion.slice(0, 5) : "-"}
            </p>
        </div>
    );
}
