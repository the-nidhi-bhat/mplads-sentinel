Project Normalizer
1. Put raw CSVs into data/: works_recommended.csv, works_sanctioned.csv, works_completed.csv
2. Run: python src/finalize_merge.py
3. Verify: python check_cols.py
4. Copy to model: python src/prepare_for_model.py