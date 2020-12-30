let changed = false
export default class Color{
    changeColour(id: string){
        let black = '#000000'
        let white = '#FFFFFF'
        if(!changed){
            // @ts-ignore
            document.getElementById(id).style.background=black;
            changed = true
        }
        else{
            // @ts-ignore
            document.getElementById(id).style.background=white;
            changed = false
        }
    }
}
