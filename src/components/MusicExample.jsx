import { useEffect, useRef } from "preact/hooks";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Accidental,
} from "vexflow";

export default function MusicExample({
  clef = "treble",
  timeSignature,
  notes = [],
  width = 400, // Este será el ancho total del lienzo
  height = 200, // Altura del lienzo
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !notes || notes.length === 0) return;
    containerRef.current.innerHTML = "";

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(width + 50, height);
    const context = renderer.getContext();

    // 1. Normalizamos la prop 'notes': Si es de 1 dimensión, lo envolvemos en un arreglo
    // para tratarlo siempre como una lista de compases (measures).
    const measures = Array.isArray(notes[0]) ? notes : [notes];

    // Calculamos el ancho de cada compás dividiendo el ancho total
    const measureWidth = width / measures.length;
    let currentX = 10; // Posición X inicial

    // 2. Función traductora encapsulada para procesar las notas de un compás
    const parseMeasureNotes = (measureNotes) => {
      return measureNotes.map((noteStr) => {
        const [keysStr, duration = "q", chordColor] = noteStr.split("|");
        const cleanKeys = [];
        const accidentalsData = [];
        const styles = {};

        keysStr.split(",").forEach((keyDef, index) => {
          const [rawKey, keyColor] = keyDef.split("@");
          let cleanKey = rawKey;
          let accSymbol = null;
          let isCautionary = false;

          const accMatch = rawKey.match(/^([a-g])(\(?[#bnd]+\)?)(\/\d+)/i);
          if (accMatch) {
            const noteName = accMatch[1];
            let accStr = accMatch[2];
            const octaveStr = accMatch[3];

            if (accStr.startsWith("(") && accStr.endsWith(")")) {
              isCautionary = true;
              accStr = accStr.slice(1, -1);
            }
            accSymbol = accStr;
            cleanKey = `${noteName}${accStr}${octaveStr}`;
          }

          cleanKeys.push(cleanKey);
          accidentalsData.push({ symbol: accSymbol, isCautionary });

          const finalColor = keyColor || chordColor;
          if (finalColor) {
            styles[index] = finalColor;
          }
        });

        const staveNote = new StaveNote({ keys: cleanKeys, duration, clef });

        accidentalsData.forEach((data, index) => {
          if (data.symbol) {
            const accidental = new Accidental(data.symbol);
            if (data.isCautionary) accidental.setAsCautionary();
            staveNote.addModifier(accidental, index);
          }
        });

        Object.entries(styles).forEach(([index, color]) => {
          staveNote.setKeyStyle(parseInt(index, 10), {
            fillStyle: color,
            strokeStyle: color,
          });
        });

        return staveNote;
      });
    };

    // 3. Iteramos sobre cada compás
    measures.forEach((measureNotes, index) => {
      const isFirstMeasure = index === 0;

      // Creamos el pentagrama en la posición X actual
      const stave = new Stave(currentX, 40, measureWidth);

      // Solo añadimos la clave y la signatura al primer compás
      if (isFirstMeasure) {
        stave.addClef(clef);
        if (timeSignature) {
          stave.addTimeSignature(timeSignature);
        }
      }

      stave.setContext(context).draw();

      if (measureNotes.length > 0) {
        const vexNotes = parseMeasureNotes(measureNotes);

        // Necesitamos una voz por cada compás para las matemáticas internas de VexFlow
        const internalTimeSig = timeSignature || "4/4";
        const [beats, beatValue] = internalTimeSig.split("/");

        const voice = new Voice({
          num_beats: parseInt(beats, 10),
          beat_value: parseInt(beatValue, 10),
        });

        voice.setStrict(false); // Sigue siendo flexible para evitar crashes
        voice.addTickables(vexNotes);

        // Formateamos y dibujamos las notas en este compás.
        // Restamos espacio (padding) al ancho para que no se peguen las notas a las líneas divisorias.
        const padding = isFirstMeasure ? 50 : 20;
        new Formatter()
          .joinVoices([voice])
          .format([voice], measureWidth - padding);
        voice.draw(context, stave);
      }

      // Actualizamos la posición X sumando el ancho del compás actual, preparándolo para el siguiente
      currentX += stave.width;
    });
  }, [clef, timeSignature, notes, width]);

  return (
    <div
      style={{ background: "white", borderRadius: "16px" }}
      ref={containerRef}
    ></div>
  );
}
