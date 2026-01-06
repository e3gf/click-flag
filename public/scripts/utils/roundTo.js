export default function roundTo(number, places){
    return Math.round(number * 10**places) / 10**places;
}