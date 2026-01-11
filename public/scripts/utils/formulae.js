export function geometricSeriesSum(a, r, n){
    return a * (1 - r ** n) / (1 - r);
}

export function geometricSeriesKthTerm(a, k, n){
    return a * k ** n; 
}