function hasValidMoves(bruv,size = 4){
    //save time, if there is an empty spot theres always a valid move
    if(bruv.includes(0)){
        return true
    }
    //otherwise, handle rare case where every spot is full but valid moves remain
   // search for ortogonally equal values
    return bruv.some((val, i, b) => {
        try{
            return (val === b[i+1] || val === b[i-1] || 
                    val === b[i + size] || val === b[i - size])         
        }catch(e){
            //cheekily ignore indexoutofboundsexceptions
        }
    })
    

}

console.log(hasValidMoves([2, 4, 8, 4, 4, 32, 4, 2, 32, 4, 128, 4, 4, 2, 4, 16]));

        