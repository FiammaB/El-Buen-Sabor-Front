// src/services/ArticuloService.ts
import axios from 'axios';

// Importa las CLASES de modelo que usarás para tus objetos de dominio en el frontend
import { ArticuloManufacturado } from '../models/Articulos/ArticuloManufacturado';
import { ArticuloInsumo } from '../models/Articulos/ArticuloInsumo';
import { Articulo } from '../models/Articulos/Articulo';
import { ArticuloManufacturadoDetalle } from '../models/Articulos/ArticuloManufacturadoDetalle';

// Importa las CLASES de modelos relacionados (ajusta las rutas según tu organización)
import { Categoria } from '../models/Categoria/Categoria';
import { Imagen } from '../models/Categoria/Imagen'; // Asumiendo que Imagen está en models/Common
import { UnidadMedida } from '../models/Categoria/UnidadMedida'; // Asumiendo que UnidadMedida está en models/Common

// Importa las INTERFACES de respuesta JSON (DTOs de backend) usando 'type'
import type { IArticuloInsumoResponseDTO } from '../models/DTO/IAArticuloInsumoResponseDTO';
import type { IArticuloManufacturadoResponseDTO } from '../models/DTO/IAArticuloManufacturadoResponseDTO';
import type { IArticuloManufacturadoDetalleResponseDTO } from '../models/DTO/IAArticuloManufacturadoDetalleResposeDTO';
import type { ICategoriaResponseDTO } from '../models/DTO/ICategoriaResponseDTO';
import type { IUnidadMedidaResponseDTO } from '../models/DTO/IUnidadMedidaResponseDTO';

const API_BASE_URL = 'http://localhost:8080/api/articuloManufacturado';
const API_INSUMO_BASE_URL = 'http://localhost:8080/api/articuloInsumo';

export class ArticuloService {

    // --- Métodos para ArticuloManufacturado ---

    /**
     * Obtiene todos los artículos manufacturados.
     * @returns Promesa que resuelve a una lista de ArticuloManufacturado.
     */
    async getAllArticulosManufacturados(): Promise<ArticuloManufacturado[]> {
        // Axios espera un array de la interfaz de respuesta del backend
        const response = await axios.get<IArticuloManufacturadoResponseDTO[]>(
            `http://localhost:8080/api/articuloManufacturado/manufacturados`
        );
        // Mapea los objetos planos JSON (interfaces) a instancias de la clase ArticuloManufacturado
        console.log("Respuesta cruda del back:", response.data);
        return response.data.map(data => this.mapToArticuloManufacturado(data));
    }

    /**
     * Obtiene un artículo manufacturado por su ID.
     * @param id El ID del artículo manufacturado.
     * @returns Promesa que resuelve a un ArticuloManufacturado o null si no se encuentra.
     */
    async getArticuloManufacturadoById(id: number): Promise<ArticuloManufacturado | null> {
        try {
            // Axios espera una única instancia de la interfaz de respuesta
            const response = await axios.get<IArticuloManufacturadoResponseDTO>(`${API_BASE_URL}/${id}`);
            return this.mapToArticuloManufacturado(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null; // No encontrado
            }
            throw error;
        }
    }

    /**
     * Crea un nuevo artículo manufacturado.
     * @param articulo El objeto ArticuloManufacturado a crear (será serializado a JSON).
     * @returns Promesa que resuelve al ArticuloManufacturado creado.
     */
    async createArticuloManufacturado(articulo: ArticuloManufacturado): Promise<ArticuloManufacturado> {
        // Axios serializa la instancia de clase a JSON.
        // La respuesta se tipa con la interfaz de respuesta del backend.
        const response = await axios.post<IArticuloManufacturadoResponseDTO>(`${API_BASE_URL}`, articulo);
        return this.mapToArticuloManufacturado(response.data);
    }

    /**
     * Actualiza un artículo manufacturado existente.
     * @param id El ID del artículo a actualizar.
     * @param articulo El objeto ArticuloManufacturado con los datos actualizados.
     * @returns Promesa que resuelve al ArticuloManufacturado actualizado.
     */
    async updateArticuloManufacturado(id: number, articulo: ArticuloManufacturado): Promise<ArticuloManufacturado> {
        const response = await axios.put<IArticuloManufacturadoResponseDTO>(`${API_BASE_URL}/${id}`, articulo);
        return this.mapToArticuloManufacturado(response.data);
    }

    /**
     * Elimina un artículo manufacturado por su ID.
     * @param id El ID del artículo a eliminar.
     * @returns Promesa que resuelve a un booleano indicando éxito.
     */
    async deleteArticuloManufacturado(id: number): Promise<boolean> {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`); // El endpoint de borrado es general para Articulo
            return true;
        } catch (error) {
            console.error("Error al eliminar artículo manufacturado:", error);
            return false;
        }
    }

    // Borrar articulo insumo
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

    /**
     * Obtiene todos los artículos insumo.
     * @returns Promesa que resuelve a una lista de ArticuloInsumo.
     */
    async getAllArticulosInsumo(): Promise<ArticuloInsumo[]> {
        const response = await axios.get<IArticuloInsumoResponseDTO[]>(`${API_INSUMO_BASE_URL}/insumos`);
        console.log("ARTICULOS TRAIDOS DEL BACK ", response)
        return response.data.map(data => this.mapToArticuloInsumo(data));
    }

    async sumarStock(id: number, cantidad: number): Promise<ArticuloInsumo> {
        // Usa PUT, tu backend ya espera un param llamado 'cantidad'
        const response = await axios.put<ArticuloInsumo>(`${API_INSUMO_BASE_URL}/${id}/sumar-stock?cantidad=${cantidad}`);
        return response.data;
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

    /**
     * Obtiene un artículo insumo por su ID.
     * @param id El ID del artículo insumo.
     * @returns Promesa que resuelve a un ArticuloInsumo o null si no se encuentra.
     */
    async getArticuloInsumoById(id: number): Promise<ArticuloInsumo | null> {
        try {
            const response = await axios.get<IArticuloInsumoResponseDTO>(`${API_INSUMO_BASE_URL}/insumos/${id}`);
            return this.mapToArticuloInsumo(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null; // No encontrado
            }
            throw error;
        }
    }

    /**
     * Crea un nuevo artículo insumo.
     * @param insumo El objeto ArticuloInsumo a crear.
     * @returns Promesa que resuelve al ArticuloInsumo creado.
     */
    async createArticuloInsumo(insumo: ArticuloInsumo): Promise<ArticuloInsumo> {
        const response = await axios.post<IArticuloInsumoResponseDTO>(`${API_INSUMO_BASE_URL}`, insumo);
        console.log("Insumo creado: ", response.data)
        return this.mapToArticuloInsumo(response.data);
    }

    /**
     * Actualiza un artículo insumo existente.
     * @param id El ID del insumo a actualizar.
     * @param insumo El objeto ArticuloInsumo con los datos actualizados.
     * @returns Promesa que resuelve al ArticuloInsumo actualizado.
     */
    async updateArticuloInsumo(id: number, insumo: ArticuloInsumo): Promise<ArticuloInsumo> {
        const response = await axios.put<IArticuloInsumoResponseDTO>(`${API_INSUMO_BASE_URL}/${id}`, insumo);
        return this.mapToArticuloInsumo(response.data);
    }

    /**
     * Obtiene artículos insumo con stock bajo.
     * @param stockMinimoReferencia Un valor opcional para filtrar por stock.
     * @returns Promesa que resuelve a una lista de ArticuloInsumo.
     */
    async getArticulosInsumoByStockBajo(stockMinimoReferencia?: number): Promise<ArticuloInsumo[]> {
        const params = stockMinimoReferencia ? { stockMinimoReferencia } : {};
        const response = await axios.get<IArticuloInsumoResponseDTO[]>(`${API_INSUMO_BASE_URL}/insumos/stock-bajo`, { params });
        return response.data.map(data => this.mapToArticuloInsumo(data));
    }

    // --- Métodos de Búsqueda General (para Articulo) ---
    // Estos endpoints pueden devolver una mezcla de ArticuloInsumo y ArticuloManufacturado.
    // La respuesta de Axios se tipa como una unión de los DTOs de respuesta.

    /**
     * Busca artículos por denominación (parcial o completa).
     * @param denominacion La denominación a buscar.
     * @returns Promesa que resuelve a una lista de Articulo (puede ser insumo o manufacturado).
     */
    async searchArticulosByDenominacion(denominacion: string): Promise<Articulo[]> {
        const response = await axios.get<(IArticuloInsumoResponseDTO | IArticuloManufacturadoResponseDTO)[]>(`${API_BASE_URL}/buscar`, { params: { denominacion } });
        return response.data.map(data => {
            // Usamos Type Guard: 'esParaElaborar' es una propiedad exclusiva de ArticuloInsumo
            if ('esParaElaborar' in data && typeof (data as IArticuloInsumoResponseDTO).esParaElaborar === 'boolean') {
                return this.mapToArticuloInsumo(data as IArticuloInsumoResponseDTO);
            }
            return this.mapToArticuloManufacturado(data as IArticuloManufacturadoResponseDTO);
        });
    }

    /**
     * Busca artículos por ID de categoría.
     * @param categoriaId El ID de la categoría.
     * @returns Promesa que resuelve a una lista de Articulo (puede ser insumo o manufacturado).
     */
    async getArticulosByCategoria(categoriaId: number): Promise<Articulo[]> {
        const response = await axios.get<(IArticuloInsumoResponseDTO | IArticuloManufacturadoResponseDTO)[]>(`${API_BASE_URL}/categoria/${categoriaId}`);
        return response.data.map(data => {
            if ('esParaElaborar' in data && typeof (data as IArticuloInsumoResponseDTO).esParaElaborar === 'boolean') {
                return this.mapToArticuloInsumo(data as IArticuloInsumoResponseDTO);
            }
            return this.mapToArticuloManufacturado(data as IArticuloManufacturadoResponseDTO);
        });
    }

    /**
     * Obtiene todos los artículos (insumos y manufacturados).
     * @returns Promesa que resuelve a una lista de Articulo.
     */
    async getAllArticulos(): Promise<Articulo[]> {
        const response = await axios.get<(IArticuloInsumoResponseDTO | IArticuloManufacturadoResponseDTO)[]>(`${API_BASE_URL}`);
        return response.data.map(data => {
            if ('esParaElaborar' in data && typeof (data as IArticuloInsumoResponseDTO).esParaElaborar === 'boolean') {
                return this.mapToArticuloInsumo(data as IArticuloInsumoResponseDTO);
            }
            return this.mapToArticuloManufacturado(data as IArticuloManufacturadoResponseDTO);
        });
    }


    // --- Métodos de Mapeo Internos (para convertir Response DTO a instancias de clase) ---
    // Estos métodos toman una interfaz de respuesta (el JSON plano) y construyen una instancia de tu clase de modelo.

    private mapToArticuloManufacturado(data: IArticuloManufacturadoResponseDTO): ArticuloManufacturado {
        // Mapea los detalles anidados
        const detalles = data.detalles && Array.isArray(data.detalles)
            ? data.detalles.map((d: IArticuloManufacturadoDetalleResponseDTO) => // 'd' ya está tipado correctamente
                new ArticuloManufacturadoDetalle(
                    d.cantidad,
                    d.articuloInsumoId,
                    d.id,
                    // Mapea el ArticuloInsumo anidado si existe
                    d.articuloInsumo ? this.mapToArticuloInsumo(d.articuloInsumo) : undefined
                )
            )
            : [];

        // Mapea objetos anidados (Categoria, Imagen, UnidadMedida) si existen
        const categoria = data.categoria
            ? new Categoria(data.categoria.denominacion, data.categoria.id, data.categoria.categoriaPadreId, data.categoria.sucursalIds)
            : undefined;
        const imagen = data.imagen
            ? new Imagen(data.imagen.denominacion, data.imagen.id)
            : undefined;
        const unidadMedida = data.unidadMedida
            ? new UnidadMedida(data.unidadMedida.denominacion, data.unidadMedida.id)
            : undefined;

        // Crea y retorna una nueva instancia de ArticuloManufacturado
        return new ArticuloManufacturado(
            data.denominacion,
            data.precioVenta,
            data.categoriaId,
            data.descripcion,
            data.tiempoEstimadoMinutos,
            data.preparacion,
            detalles, // Pasa la lista de detalles mapeados
            data.id,
            data.imagenId,
            imagen,
            categoria,
            data.unidadMedidaId, // Asegúrate de que esta propiedad exista en tu clase ArticuloManufacturado si la pasas
            unidadMedida // Asegúrate de que esta propiedad exista en tu clase ArticuloManufacturado si la pasas
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

    /**
     * Obtiene todas las unidades de medida.
     * @returns Promesa que resuelve a una lista de UnidadMedida.
     */
    async getAllUnidadesMedida(): Promise<UnidadMedida[]> {
        const response = await axios.get<IUnidadMedidaResponseDTO[]>(`http://localhost:8080/api/unidades-medida`);
        return response.data.map(data =>
            new UnidadMedida(data.denominacion, data.id)
        );
    }
    /** 
     @param articuloId El ID del artículo al que se asociará la imagen.
   * @param file El archivo de imagen a subir (File).
   * @returns Promesa que resuelve a la URL de la imagen guardada o un objeto Imagen.
   */

    async uploadArticuloImagen(articuloId: number, file: File): Promise<Imagen> {

        const API_UPLOAD_URL = 'http://localhost:8080/api/uploads'; // URL base para subir imágenes

        const formData = new FormData();
        formData.append('file', file); // 'file' debe coincidir con el @RequestParam del backend
        formData.append('idArticulo', articuloId.toString()); // 'idArticulo' debe coincidir con el @RequestParam del backend

        try {
            // Endpoint de subida de imagen en el backend.
            // Asumiendo que el backend tiene un controlador para manejar uploads,
            // ej. POST /api/uploads/articulo-imagen
            const response = await axios.post<Imagen>(`${API_UPLOAD_URL}/articulo-imagen`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Importante para enviar archivos
                },
            });
            return new Imagen(response.data.denominacion, response.data.id); // Mapear la respuesta a la clase Imagen
        } catch (error) {
            console.error("Error al subir la imagen:", error);
            throw error; // Propagar el error para manejarlo en el componente
        }
    }
    /**
      * Obtiene todos los artículos manufacturados que están activos (no dados de baja).
      * Este método DEBE llamar a un endpoint en el backend que filtre por 'estaDadoDeBaja = false'.
      * En el backend, ArticuloServiceImpl.findAllArticulosManufacturadosActivos() ya hace esto.
      * @returns Promesa que resuelve a una lista de ArticuloManufacturado activo.
      */
    async findAllArticulosManufacturadosActivos(): Promise<ArticuloManufacturado[]> {
        // Asumiendo que el endpoint /manufacturados/activos existe y devuelve solo los activos
        // O que el endpoint general /manufacturados ya ha sido modificado en el backend para solo devolver activos.
        // Si tu backend modificó findAllManufacturados para devolver solo activos, puedes seguir usando getAllArticulosManufacturados.
        // Si tienes un endpoint específico en el backend como "/manufacturados/activos", úsalo aquí.
        const response = await axios.get<IArticuloManufacturadoResponseDTO[]>(`${API_BASE_URL}/articuloManufacturado/manufacturados`); // O /manufacturados/activos si lo creaste
        return response.data.map(data => this.mapToArticuloManufacturado(data));
    }
}