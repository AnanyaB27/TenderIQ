from typing import Generic, TypeVar

from sqlalchemy.ext.asyncio import AsyncSession

ModelT = TypeVar("ModelT")


class TenantScopedRepository(Generic[ModelT]):
    """Mirrors backend/libs/database's tenant-isolation invariant on the AI
    Engine side (Architecture.md §9.4, §13.3). Real predicate-injection logic
    is implemented in a later phase.
    """

    def __init__(self, session: AsyncSession, model: type[ModelT]) -> None:
        self._session = session
        self._model = model
