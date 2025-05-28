from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Generation(Base):
    __tablename__ = "generations"
    
    id = Column(String, primary_key=True)
    prompt = Column(Text, nullable=False)
    preprocessor = Column(String, nullable=False)
    input_image_path = Column(String, nullable=False)
    output_image_path = Column(String, nullable=True)
    status = Column(String, nullable=False)  # 'processing', 'completed', 'error'
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False)