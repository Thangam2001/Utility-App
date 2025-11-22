CREATE TABLE IF NOT EXISTS operation_history (
    id UUID PRIMARY KEY,
    file_name TEXT NOT NULL,
    operation_type TEXT NOT NULL CHECK (operation_type IN ('ocr', 'resize', 'convert')),
    original_format TEXT,
    output_format TEXT,
    file_size BIGINT,
    result_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operation_history_performed_at ON operation_history (performed_at DESC);


