import { useEffect, useRef } from "react";

export function useAutoLogout(
    logoutFn: () => void,
    tipo: "cliente" | "empleado",
    horarioApertura?: string,
    horarioCierre?: string
) {
    const timer = useRef<number>();

    // Utilidad para ver si es horario de atención
    const esHorarioAtencion = () => {
        if (!horarioApertura || !horarioCierre) return false;
        const ahora = new Date();
        const [hA, mA] = horarioApertura.split(":").map(Number);
        const [hC, mC] = horarioCierre.split(":").map(Number);
        const desde = new Date(ahora);
        desde.setHours(hA, mA, 0, 0);
        const hasta = new Date(ahora);
        hasta.setHours(hC, mC, 0, 0);
        return ahora >= desde && ahora <= hasta;
    };

    useEffect(() => {
        let tiempoMaximo = 0;
        if (tipo === "cliente") tiempoMaximo = 45 * 60 * 1000;
        if (tipo === "empleado") {
            // Si está en horario de atención, NO se hace auto-logout
            if (esHorarioAtencion()) {
                if (timer.current) clearTimeout(timer.current);
                return;
            }
            tiempoMaximo = 30 * 60 * 1000;
        }

        const resetTimer = () => {
            if (timer.current) clearTimeout(timer.current);
            timer.current = window.setTimeout(() => {
                logoutFn();
                alert("Sesión cerrada por inactividad.");
            }, tiempoMaximo);
        };

        const eventos = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"];
        eventos.forEach(ev => window.addEventListener(ev, resetTimer));

        resetTimer();

        return () => {
            if (timer.current) clearTimeout(timer.current);
            eventos.forEach(ev => window.removeEventListener(ev, resetTimer));
        };
    }, [tipo, horarioApertura, horarioCierre, esHorarioAtencion]);
}
