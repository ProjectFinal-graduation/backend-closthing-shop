const SortInCategory = (Sort) => {
    const { Mode, By } = Sort;
    const sortOrder = By === "ASC" ? 1 : -1;
    let query = {};
    switch (Mode) {
        case 1: // Sort by Price
            query = { price: sortOrder };
            break;
        case 2: // Sort by Name
            query = { name: sortOrder };
            break;
        case 3: // Sort by Discount
            query = { discount: sortOrder };
            break;
        case 4: // Sort by CreatedAt
            query = { createdAt: sortOrder };
            break;
        case 5: // Sort by UpdatedAt
            query = { updatedAt: sortOrder };
            break;
        default:
    }
    return query;
}

module.exports = {
    SortInCategory
}