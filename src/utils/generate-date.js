const generateDate = () => {
    const date = new Date();
    const gmtPlus7Offset = 7 * 60;
    return new Date(date.getTime() + gmtPlus7Offset * 60 * 1000);
}

export { generateDate };