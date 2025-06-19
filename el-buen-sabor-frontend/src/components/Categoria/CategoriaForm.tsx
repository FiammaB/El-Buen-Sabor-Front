import { useEffect, useRef, useState } from 'react';

export default function CategoriaForm({ categorias, reloadCategorias }: { categorias: any, reloadCategorias: any }) {
	const [isOpen, setIsOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [denominacion, setDenominacion] = useState('');
	const [catPadre, setCatPadre] = useState('');

	useEffect(() => {
		const button = document.getElementById('createCategory');
		const handleClick = () => setIsOpen(true);
		button?.addEventListener('click', handleClick);

		const handleClickOutside = (event: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			button?.removeEventListener('click', handleClick);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const data = {
			denominacion,
			categoriaPadre: catPadre !== '' ? { id: Number(catPadre) } : null
		};

		try {
<<<<<<< HEAD
			const res = await fetch('http://localhost:8080/api/v1/categorias', {
=======
			const res = await fetch('http://localhost:8080/api/categorias', {
>>>>>>> login-con-roles
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (res.ok) {
				alert('Categoría creada exitosamente');
				setIsOpen(false);
				setDenominacion('');
				setCatPadre('');
				reloadCategorias?.();
			} else {
				alert('Error al crear la categoría');
			}
		} catch (error) {
			console.error(error);
			alert('Error de red');
		}
	};

	if (!isOpen) return null;

	return (
		<div className="floating-form-wrapper">
			<div className="floating-form" ref={wrapperRef}>
				<h3>Crear Categoria</h3>
				<form onSubmit={handleSubmit}>
					<label htmlFor="denominacion">
						<p>Nombre</p>
						<input
							type="text"
							name="denominacion"
							value={denominacion}
							onChange={(e) => setDenominacion(e.target.value)}
							required
						/>
					</label>
					<label htmlFor="catPadre">
						<p>Categoria Padre</p>
						<select
							name="catPadre"
							value={catPadre}
							onChange={(e) => setCatPadre(e.target.value)}
						>
							<option value="">Ninguna</option>
							{categorias.map((categoria: any) => (
								<option key={categoria?.id} value={categoria?.id}>
									{categoria?.denominacion}
								</option>
							))}
						</select>
					</label>
					<button type="submit">Crear categoría</button>
				</form>
			</div>
		</div>
	);
}
