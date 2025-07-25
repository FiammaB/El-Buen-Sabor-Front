// src/services/ArticuloService.ts
import axios from 'axios'; // <-- Revertimos la importación de axios

// Importa las CLASES de modelo que usarás para tus objetos de dominio en el frontend
import { ArticuloManufacturado } from '../models/Articulos/ArticuloManufacturado';
import { ArticuloInsumo } from '../models/Articulos/ArticuloInsumo';
import { Articulo } from '../models/Articulos/Articulo'; // Clase base Articulo
import { ArticuloManufacturadoDetalle } from '../models/Articulos/ArticuloManufacturadoDetalle';

// Importa las CLASES de modelos relacionados (ajusta las rutas según tu organización)
import { Categoria } from '../models/Categoria/Categoria';
import { Imagen } from '../models/Categoria/Imagen';
import { UnidadMedida } from '../models/Categoria/UnidadMedida';

// Importa las INTERFACES de respuesta JSON (DTOs de backend) usando 'type'
// ¡Asegúrate que los nombres IArticuloInsumoResponseDTO y IArticuloManufacturadoResponseDTO sean EXACTOS!
import type { IArticuloInsumoResponseDTO } from '../models/DTO/IAArticuloInsumoResponseDTO'; // Confirmado que es IArticuloInsumoResponseDTO
import type { IArticuloManufacturadoResponseDTO } from '../models/DTO/IAArticuloManufacturadoResponseDTO'; // Confirmado que es IArticuloManufacturadoResponseDTO
import type { IArticuloManufacturadoDetalleResponseDTO } from '../models/DTO/IAArticuloManufacturadoDetalleResposeDTO';
import type { ICategoriaResponseDTO } from '../models/DTO/ICategoriaResponseDTO';
import type { IUnidadMedidaResponseDTO } from '../models/DTO/IUnidadMedidaResponseDTO';

const API_BASE_URL = 'http://localhost:8080/api/articuloManufacturado';
const API_INSUMO_BASE_URL = 'http://localhost:8080/api/articuloInsumo';

export class ArticuloService {

    // --- Métodos para ArticuloManufacturado ---

    async getAllArticulosManufacturados(): Promise<ArticuloManufacturado[]> {
        const response = await axios.get<IArticuloManufacturadoResponseDTO[]>(
            `http://localhost:8080/api/articuloManufacturado/manufacturados`
        );
        console.log("Respuesta cruda del back:", response.data);
        return response.data.map(data => this.mapToArticuloManufacturado(data));
    }

    async getArticuloManufacturadoById(id: number): Promise<ArticuloManufacturado | null> {
        try {
            const response = await axios.get<IArticuloManufacturadoResponseDTO>(`/api/articuloManufacturado/${id}`);
            return this.mapToArticuloManufacturado(response.data); // Asegúrate que esta función haga bien el mapping
        } catch (error) {
            console.error("Error obteniendo artículo manufacturado por ID:", error);
            return null;
        }
    }

    async findAllArticulosInsumoActivos(): Promise<ArticuloInsumo[]> {
        try {
            const response = await axios.get<IArticuloInsumoResponseDTO[]>(`${API_INSUMO_BASE_URL}/insumos`);
            const allInsumos: IArticuloInsumoResponseDTO[] = response.data;

            // Filtra en el frontend: solo activos (baja = false), con stockActual > 0 y NO esParaElaborar
            const filteredInsumos = allInsumos.filter(insumo =>
                insumo.baja === false && insumo.stockActual > 0 && insumo.esParaElaborar === false // <--- NUEVA CONDICIÓN
            );

            return filteredInsumos.map(data => this.mapToArticuloInsumo(data));
        } catch (error) {
            console.error('Error al cargar y filtrar artículos insumo activos:', error);
            throw error;
        }
    }
    async createArticuloManufacturado(articulo: ArticuloManufacturado): Promise<ArticuloManufacturado> {
        const response = await axios.post<IArticuloManufacturadoResponseDTO>(`${API_BASE_URL}`, articulo);
        return this.mapToArticuloManufacturado(response.data);
    }

    async updateArticuloManufacturado(id: number, articulo: ArticuloManufacturado): Promise<ArticuloManufacturado> {
        console.log("Articulo a actualizar: ", articulo)
        const response = await axios.put<IArticuloManufacturadoResponseDTO>(`${API_BASE_URL}/${id}`, articulo);
        return this.mapToArticuloManufacturado(response.data);
    }

    async deleteArticuloManufacturado(id: number): Promise<boolean> {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar artículo manufacturado:", error);
            return false;
        }
    }

    deleteArticulo(id: number): Promise<void> {
        console.log("Id a desactivar: ", id)
        return fetch(`${API_INSUMO_BASE_URL}/${id}/deactivate`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(response => {
            if (!response.ok) {
                throw new Error('Error al desactivar el ingrediente.');
            }
        });
    }

    async toggleArticuloManufacturadoBaja(id: number, baja: boolean): Promise<void> {
        await axios.patch(`http://localhost:8080/api/articuloManufacturado/${id}/baja?baja=${baja}`);
    }

    // --- Métodos para ArticuloInsumo (ABM de Insumos) ---

    async findAllArticulosInsumo(): Promise<ArticuloInsumo[]> {
        try {
            const response = await axios.get<IArticuloInsumoResponseDTO[]>(`${API_INSUMO_BASE_URL}/insumos`);
            const allInsumos: IArticuloInsumoResponseDTO[] = response.data;

            // Filtra en el frontend: solo activos (baja = false), con stockActual > 0 y NO esParaElaborar
            const filteredInsumos = allInsumos.filter(insumo =>
                insumo.esParaElaborar === false // <--- NUEVA CONDICIÓN
            );

            return filteredInsumos.map(data => this.mapToArticuloInsumo(data));
        } catch (error) {
            console.error('Error al cargar y filtrar artículos insumo activos:', error);
            throw error;
        }
    }

    async getAllArticulosInsumo(): Promise<ArticuloInsumo[]> {
        const response = await axios.get<IArticuloInsumoResponseDTO[]>(`${API_INSUMO_BASE_URL}/insumos`);
        console.log("ARTICULOS TRAIDOS DEL BACK ", response)
        return response.data.map(data => this.mapToArticuloInsumo(data));
    }

    async sumarStock(id: number, cantidad: number): Promise<ArticuloInsumo> {
        const response = await axios.put<ArticuloInsumo>(`${API_INSUMO_BASE_URL}/${id}/sumar-stock?cantidad=${cantidad}`);
        return response.data;
    }

    async restarStock(id: number, cantidad: number): Promise<void> {
        await axios.put(`${API_INSUMO_BASE_URL}/${id}/restar-stock?cantidad=${cantidad}`);
    }


    async actualizarPrecioCompra(id: number, precioCompra: number): Promise<void> {
        try {
            await axios.put(`${API_INSUMO_BASE_URL}/${id}/actualizar-precio`, null, {
                params: { precioCompra }
            });
        } catch (error) {
            console.error("Error actualizando precio de compra", error);
            throw error;
        }
    }

    toggleBaja(id: number, baja: boolean): Promise<void> {
        return fetch(`/api/articuloInsumo/${id}/baja?baja=${baja}`, {
            method: 'PATCH',
        }).then(response => {
            if (!response.ok) {
                throw new Error('No se pudo actualizar el estado de baja.');
            }
        });
    }

    async getArticuloInsumoById(id: number): Promise<ArticuloInsumo | null> {
        try {
            const response = await axios.get<IArticuloInsumoResponseDTO>(`${API_INSUMO_BASE_URL}/insumos/${id}`);
            return this.mapToArticuloInsumo(response.data);
        } catch (error) {
            console.log('Error al obtener el artículo insumo:', error);
            throw error;
        }
    }

    async createArticuloInsumo(insumo: ArticuloInsumo): Promise<ArticuloInsumo> {
        const response = await axios.post<IArticuloInsumoResponseDTO>(`${API_INSUMO_BASE_URL}`, insumo);
        console.log("Insumo creado: ", response.data)
        return this.mapToArticuloInsumo(response.data);
    }

    async updateArticuloInsumo(id: number, insumo: ArticuloInsumo): Promise<ArticuloInsumo> {
        const response = await axios.put<IArticuloInsumoResponseDTO>(`${API_INSUMO_BASE_URL}/${id}`, insumo);
        return this.mapToArticuloInsumo(response.data);
    }

    async getArticulosInsumoByStockBajo(stockMinimoReferencia?: number): Promise<ArticuloInsumo[]> {
        const params = stockMinimoReferencia ? { stockMinimoReferencia } : {};
        const response = await axios.get<IArticuloInsumoResponseDTO[]>(`${API_INSUMO_BASE_URL}/insumos/stock-bajo`, { params });
        return response.data.map(data => this.mapToArticuloInsumo(data));
    }

    // --- Métodos de Búsqueda General (para Articulo) ---
    // Estos endpoints pueden devolver una mezcla de ArticuloInsumo y ArticuloManufacturado.

    async searchArticulosByDenominacion(denominacion: string): Promise<Articulo[]> {
        const response = await axios.get<(IArticuloInsumoResponseDTO | IArticuloManufacturadoResponseDTO)[]>(`${API_BASE_URL}/buscar`, { params: { denominacion } });
        return response.data.map(data => {
            if ('esParaElaborar' in data && typeof (data as IArticuloInsumoResponseDTO).esParaElaborar === 'boolean') {
                return this.mapToArticuloInsumo(data as IArticuloInsumoResponseDTO);
            }
            return this.mapToArticuloManufacturado(data as IArticuloManufacturadoResponseDTO);
        });
    }

    async getArticulosByCategoria(categoriaId: number): Promise<Articulo[]> {
        const response = await axios.get<(IArticuloInsumoResponseDTO | IArticuloManufacturadoResponseDTO)[]>(`${API_BASE_URL}/categoria/${categoriaId}`);
        return response.data.map(data => {
            if ('esParaElaborar' in data && typeof (data as IArticuloInsumoResponseDTO).esParaElaborar === 'boolean') {
                return this.mapToArticuloInsumo(data as IArticuloInsumoResponseDTO);
            }
            return this.mapToArticuloManufacturado(data as IArticuloManufacturadoResponseDTO);
        });
    }

    async getAllArticulos(): Promise<Articulo[]> {
        const response = await axios.get<(IArticuloInsumoResponseDTO | IArticuloManufacturadoResponseDTO)[]>(`${API_BASE_URL}`);
        return response.data.map(data => {
            if ('esParaElaborar' in data && typeof (data as IArticuloInsumoResponseDTO).esParaElaborar === 'boolean') {
                return this.mapToArticuloInsumo(data as IArticuloInsumoResponseDTO);
            }
            return this.mapToArticuloManufacturado(data as IArticuloManufacturadoResponseDTO);
        });
    }

    async getIngredientesBajoStock(
        insumos: ArticuloInsumo[],
        porcentajeAlerta: number = 20
    ) {
        return insumos.filter(i => {
            if (i.baja) return false;
            if (i.stockActual < i.stockMinimo) return true;
            return i.stockActual <= i.stockMinimo * (porcentajeAlerta / 100);
        });
    }


    // --- Métodos de Mapeo Internos (para convertir Response DTO a instancias de clase) ---

    private mapToArticuloManufacturado(data: IArticuloManufacturadoResponseDTO): ArticuloManufacturado {
        const detalles = data.detalles && Array.isArray(data.detalles)
            ? data.detalles.map((d: IArticuloManufacturadoDetalleResponseDTO) =>
                new ArticuloManufacturadoDetalle(
                    d.cantidad,
                    d.articuloInsumoId,
                    d.id,
                    d.articuloInsumo ? this.mapToArticuloInsumo(d.articuloInsumo) : undefined // Mapea el ArticuloInsumo anidado
                )
            )
            : [];

        const categoria = data.categoria
            ? new Categoria(data.categoria.denominacion, data.categoria.id, data.categoria.categoriaPadreId, data.categoria.sucursalIds)
            : undefined;
        const imagen = data.imagen
            ? new Imagen(data.imagen.denominacion, data.imagen.id)
            : undefined;
        const unidadMedida = data.unidadMedida
            ? new UnidadMedida(data.unidadMedida.denominacion, data.unidadMedida.id)
            : undefined;

        return new ArticuloManufacturado(
            data.denominacion,
            data.precioVenta,
            data.categoriaId,
            data.descripcion, // Descripcion presente en manufacturado
            data.tiempoEstimadoMinutos, // TiempoEstimadoMinutos presente en manufacturado
            data.preparacion,
            detalles,
            data.id,
            data.imagenId,
            imagen,
            categoria,
            data.unidadMedidaId,
            unidadMedida,
            data.baja,
        );
    }

    private mapToArticuloInsumo(data: IArticuloInsumoResponseDTO): ArticuloInsumo {
        const categoria = data.categoria
            ? new Categoria(data.categoria.denominacion, data.categoria.id, data.categoria.categoriaPadreId, data.categoria.sucursalIds)
            : undefined;
        const imagen = data.imagen
            ? new Imagen(data.imagen.denominacion, data.imagen.id)
            : undefined;
        const unidadMedida = data.unidadMedida
            ? new UnidadMedida(data.unidadMedida.denominacion, data.unidadMedida.id)
            : undefined;

        return new ArticuloInsumo(
            data.denominacion,
            data.precioVenta,
            data.categoriaId,
            data.precioCompra,
            data.stockActual,
            data.stockMinimo,
            data.esParaElaborar,
            data.unidadMedidaId,
            data.id,
            data.imagenId,
            imagen,
            categoria,
            unidadMedida,
            data.baja
        );
    }


    async getAllCategorias(): Promise<Categoria[]> {
        const response = await axios.get<ICategoriaResponseDTO[]>(`http://localhost:8080/api/categorias`);
        return response.data.map(data =>
            new Categoria(data.denominacion, data.id, data.categoriaPadreId, data.sucursalIds)
        );
    }

    async getAllUnidadesMedida(): Promise<UnidadMedida[]> {
        const response = await axios.get<IUnidadMedidaResponseDTO[]>(`http://localhost:8080/api/unidades-medida`);
        return response.data.map(data =>
            new UnidadMedida(data.denominacion, data.id)
        );
    }

    async uploadArticuloImagen(articuloId: number, file: File): Promise<Imagen> {
        const API_UPLOAD_URL = 'http://localhost:8080/api/uploads';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('idArticulo', articuloId.toString());

        try {
            const response = await axios.post<Imagen>(`${API_UPLOAD_URL}/articulo-imagen`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return new Imagen(response.data.denominacion, response.data.id);
        } catch (error) {
            console.error("Error al subir la imagen:", error);
            throw error;
        }
    }

    // Método para obtener solo ArticulosManufacturados activos, devolviendo las CLASES.
    // Confirmo que usas el endpoint /manufacturados y mapeas a la clase.
    async findAllArticulosManufacturadosActivos(): Promise<ArticuloManufacturado[]> {
        const response = await axios.get<IArticuloManufacturadoResponseDTO[]>(`${API_BASE_URL}/manufacturados`);
        return response.data.map(data => this.mapToArticuloManufacturado(data));
    }
}