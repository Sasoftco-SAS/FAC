import { FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms"

export const validarValorEstimado: ValidatorFn = (
  control: FormGroup
): ValidationErrors | null => {
    const disponible = control.get("valor_disponible")
    const estimado = control.get("valor_estimado")
    //console.log("d//",disponible, "e//", estimado)
    if(disponible.value < estimado.value){
        return { noCumple: false }
    }else{
        null
    }

}