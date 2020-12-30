
// @ts-ignore
import colour from 'color';
// @ts-ignore
import size from 'size';


export class SizeAndColour {
    private _colour: colour;
    private _size: size;
    constructor() {
        console.log ("SizeandColour constructed");
        this._colour = new colour();
        this._size = new size();
        let btn = document.getElementById("coolbutton");
        console.log("Sono nel constru")
        // @ts-ignore
        btn.addEventListener("click", (e:Event) => this.colora);
        console.log("btn: "+btn)
    }
    colora(id: any) {
        this._colour.changeColour(id);
    }
}

