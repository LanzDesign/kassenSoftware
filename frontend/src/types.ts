export interface Kassenabrechnung {
  id?: number;
  datum: string;
  kassenstand_anfang: number;
  anzahl_kinder: number;
  anzahl_erwachsene: number;
  anzahl_tee: number;
  preis_kinder: number;
  preis_erwachsene: number;
  preis_tee: number;
  rueckgeldspende: number;
  anzahl_50euro: number;
  anzahl_20euro: number;
  anzahl_10euro: number;
  anzahl_5euro: number;
  anzahl_2euro: number;
  anzahl_1euro: number;
  anzahl_50cent: number;
  anzahl_20cent: number;
  anzahl_10cent: number;
  gegeben: number;
  rueckgeld: number;
  tageseinnahmen_gesamt?: number;
  kassenstand_soll?: number;
  bargeld_gesamt?: number;
}
