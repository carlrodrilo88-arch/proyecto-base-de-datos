CREATE TRIGGER trg_reportes_actualizado_en
BEFORE UPDATE ON reportes
FOR EACH ROW
EXECUTE FUNCTION set_actualizado_en();
