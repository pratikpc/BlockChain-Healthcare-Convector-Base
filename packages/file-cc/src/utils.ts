export function ToArray<T>(element: T | Array<T>) {
    if(element == null)
        return [];
    if (element instanceof Array)
        return element;
    else
        return [element];
}

